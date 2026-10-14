import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type {
  Episode,
  EpisodeRef,
  LoadedDetails,
  SeasonSummary,
  Status,
  TrackedTitle,
} from '../domain/types';
import { toNewTitle } from '../domain/newTitle';
import {
  episodeKey,
  episodesUpTo,
  formatNextEpisode,
  isAired,
  isoDate,
  latestEpisode,
  nextToWatch,
  progressLabel,
  progressPercent,
  statusAfterMark,
} from '../domain/progress';
import { getSeason, loadDetails } from '../tmdb/api';
import { describeTmdbError } from '../tmdb/client';
import { posterUrl } from '../tmdb/images';
import { getAppDb } from '../db/appDb';
import {
  addTitle,
  getTitle,
  setStatus,
  updateTotalEpisodes,
} from '../db/titles';
import { listWatched, markEpisodes, unmarkEpisode } from '../db/episodes';
import { STATUS_TABS, StatusFilter } from '../components/StatusFilter';
import { EpisodeRow } from '../components/EpisodeRow';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

type ChipLayout = { x: number; width: number };

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);
const NO_SEASONS: SeasonSummary[] = [];

function statusIndex(status: Status): number {
  return STATUS_TABS.findIndex(tab => tab.status === status);
}

function metaLine(loaded: LoadedDetails): string {
  if (loaded.mediaType === 'tv') {
    const seasons = loaded.details.seasons.length;
    const episodes = loaded.details.totalEpisodes;
    return `Series · ${seasons} ${
      seasons === 1 ? 'season' : 'seasons'
    } · ${episodes} episodes`;
  }
  const year = loaded.details.releaseDate?.slice(0, 4);
  return year !== undefined ? `Movie · ${year}` : 'Movie';
}

function sameEpisode(a: EpisodeRef, b: EpisodeRef): boolean {
  return (
    a.seasonNumber === b.seasonNumber && a.episodeNumber === b.episodeNumber
  );
}

function chipCenter(chip: ChipLayout): number {
  return chip.x + chip.width / 2;
}

export function DetailsScreen({ route }: Props): React.JSX.Element {
  const { mediaType, tmdbId } = route.params;

  const [loaded, setLoaded] = useState<LoadedDetails | null>(null);
  const [tracked, setTracked] = useState<TrackedTitle | null>(null);
  const [watched, setWatched] = useState<EpisodeRef[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState(false);

  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [episodesBySeason, setEpisodesBySeason] = useState<
    Record<number, Episode[]>
  >({});
  const [pageHeights, setPageHeights] = useState<Record<number, number>>({});

  const statusProgress = useRef(new Animated.Value(0)).current;
  const shownStatus = useRef<Status | null>(null);
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // The pager writes these two values on the native thread.
  const pagePosition = useRef(new Animated.Value(0)).current;
  const pageOffset = useRef(new Animated.Value(0)).current;
  const seasonProgress = useMemo(
    () => Animated.add(pagePosition, pageOffset),
    [pagePosition, pageOffset],
  );
  const onPageScroll = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { position: pagePosition, offset: pageOffset } }],
        { useNativeDriver: true },
      ),
    [pagePosition, pageOffset],
  );
  const seasonProgressReady = useRef(false);

  const pagerRef = useRef<PagerView>(null);
  const chipRowRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const chipLayouts = useRef<Record<number, ChipLayout>>({});
  const chipRowWidth = useRef(0);
  const chipsPositioned = useRef(false);
  const requestedSeasons = useRef(new Set<number>());

  const load = useCallback(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      try {
        const db = await getAppDb();
        const [details, initialLocal] = await Promise.all([
          loadDetails(mediaType, tmdbId),
          getTitle(db, mediaType, tmdbId),
        ]);
        let local = initialLocal;

        if (
          local !== null &&
          details.mediaType === 'tv' &&
          local.totalEpisodes !== details.details.totalEpisodes
        ) {
          await updateTotalEpisodes(
            db,
            local.id,
            details.details.totalEpisodes,
          );
          local = await getTitle(db, mediaType, tmdbId);
        }

        const watchedList =
          local !== null ? await listWatched(db, local.id) : [];

        if (!cancelled) {
          setLoaded(details);
          setTracked(local);
          setWatched(watchedList);
          if (details.mediaType === 'tv') {
            const start =
              nextToWatch(details.details.seasons, watchedList)?.seasonNumber ??
              latestEpisode(watchedList)?.seasonNumber ??
              details.details.seasons[0]?.seasonNumber ??
              1;
            setSelectedSeason(current => current ?? start);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(describeTmdbError(e));
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [mediaType, tmdbId]);

  useFocusEffect(load);

  const seasons = useMemo(
    () => (loaded?.mediaType === 'tv' ? loaded.details.seasons : NO_SEASONS),
    [loaded],
  );

  // Only the first time: wait until the details and the starting season
  // are loaded. After that the page stays visible.
  const firstLoadDone =
    loaded !== null &&
    (loaded.mediaType === 'movie' ||
      seasons.length === 0 ||
      (selectedSeason !== null &&
        episodesBySeason[selectedSeason] !== undefined));

  useEffect(() => {
    if (firstLoadDone && !shown) {
      setShown(true);
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [firstLoadDone, shown, contentOpacity]);

  // Start the chip highlight on the starting season (only once).
  useEffect(() => {
    if (selectedSeason === null || seasonProgressReady.current) {
      return;
    }
    const index = seasons.findIndex(s => s.seasonNumber === selectedSeason);
    if (index >= 0) {
      pagePosition.setValue(index);
      pageOffset.setValue(0);
      seasonProgressReady.current = true;
    }
  }, [selectedSeason, seasons, pagePosition, pageOffset]);

  // Load every season of this show in the background, the ones closest
  // to the selected season first. Each season is requested only once.
  useEffect(() => {
    if (selectedSeason === null || seasons.length === 0) {
      return;
    }
    const byDistance = [...seasons].sort(
      (a, b) =>
        Math.abs(a.seasonNumber - selectedSeason) -
        Math.abs(b.seasonNumber - selectedSeason),
    );
    for (const { seasonNumber } of byDistance) {
      if (requestedSeasons.current.has(seasonNumber)) {
        continue;
      }
      requestedSeasons.current.add(seasonNumber);
      getSeason(tmdbId, seasonNumber)
        .then(found =>
          setEpisodesBySeason(previous => ({
            ...previous,
            [seasonNumber]: found,
          })),
        )
        .catch(() => {
          // Allow a retry the next time this season is selected.
          requestedSeasons.current.delete(seasonNumber);
        });
    }
  }, [selectedSeason, seasons, tmdbId]);

  // Move the tab underline when the stored status changes.
  useEffect(() => {
    if (tracked === null) {
      return;
    }
    const target = statusIndex(tracked.status);
    if (shownStatus.current === null) {
      statusProgress.setValue(target);
    } else if (shownStatus.current !== tracked.status) {
      Animated.timing(statusProgress, {
        toValue: target,
        duration: 220,
        useNativeDriver: false,
      }).start();
    }
    shownStatus.current = tracked.status;
  }, [tracked, statusProgress]);

  // Scroll the chip row so this season's chip is in the middle.
  // Called directly from the pager and tap handlers, without waiting
  // for React to re-render.
  function centerChip(seasonNumber: number, animated: boolean) {
    const chip = chipLayouts.current[seasonNumber];
    if (chip === undefined || chipRowWidth.current === 0) {
      return;
    }
    chipRowRef.current?.scrollTo({
      x: Math.max(0, chipCenter(chip) - chipRowWidth.current / 2),
      animated,
    });
  }

  // Put the starting chip in the middle once its size is known.
  function onChipLayout(seasonNumber: number, layout: ChipLayout) {
    chipLayouts.current[seasonNumber] = layout;
    if (
      !chipsPositioned.current &&
      seasonNumber === selectedSeason &&
      chipRowWidth.current > 0
    ) {
      chipsPositioned.current = true;
      centerChip(seasonNumber, false);
    }
  }

  async function reloadLocal() {
    const db = await getAppDb();
    const local = await getTitle(db, mediaType, tmdbId);
    setTracked(local);
    setWatched(local !== null ? await listWatched(db, local.id) : []);
  }

  async function add(status: Status) {
    if (loaded === null) {
      return;
    }
    try {
      const db = await getAppDb();
      await addTitle(db, toNewTitle(loaded, status), Date.now());
      await reloadLocal();
    } catch (e) {
      console.log('Add failed:', e);
    }
  }

  async function changeStatus(status: Status) {
    if (tracked === null || tracked.status === status) {
      return;
    }
    try {
      const db = await getAppDb();
      await setStatus(db, tracked.id, status);
      await reloadLocal();
    } catch (e) {
      console.log('Status change failed:', e);
    }
  }

  async function toggleEpisode(episode: Episode, isWatched: boolean) {
    if (tracked === null) {
      return;
    }
    const ref: EpisodeRef = {
      seasonNumber: episode.seasonNumber,
      episodeNumber: episode.episodeNumber,
    };
    const toMark = episodesUpTo(seasons, ref);
    const nextStatus = statusAfterMark(tracked.status);

    // 1. Update the screen right away.
    if (isWatched) {
      setWatched(previous => previous.filter(r => !sameEpisode(r, ref)));
    } else {
      setWatched(previous => {
        const keys = new Set(previous.map(episodeKey));
        return [...previous, ...toMark.filter(r => !keys.has(episodeKey(r)))];
      });
      if (nextStatus !== tracked.status) {
        setTracked({ ...tracked, status: nextStatus });
      }
    }

    // 2. Write to the database in the background.
    try {
      const db = await getAppDb();
      if (isWatched) {
        await unmarkEpisode(db, tracked.id, ref);
      } else {
        await markEpisodes(db, tracked.id, toMark, Date.now());
        if (nextStatus !== tracked.status) {
          await setStatus(db, tracked.id, nextStatus);
        }
      }
    } catch (e) {
      console.log('Toggle failed:', e);
    }

    // 3. Reload, so the screen always ends up showing what is stored.
    await reloadLocal();
  }

  // A toggle function that stays the same between renders, so the
  // memoized episode rows do not all redraw on every tap.
  const toggleRef = useRef(toggleEpisode);
  useEffect(() => {
    toggleRef.current = toggleEpisode;
  });
  const onToggleEpisode = useCallback(
    (episode: Episode, isWatched: boolean) => {
      toggleRef.current(episode, isWatched);
    },
    [],
  );

  function selectSeason(seasonNumber: number) {
    const index = seasons.findIndex(s => s.seasonNumber === seasonNumber);
    if (index >= 0) {
      centerChip(seasonNumber, true);
      pagerRef.current?.setPage(index);
    }
  }

  function onPageSelected(position: number) {
    const season = seasons[position];
    if (season === undefined) {
      return;
    }
    centerChip(season.seasonNumber, true);
    setSelectedSeason(season.seasonNumber);
  }

  if (error !== null) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!shown || loaded === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#a8c7fa" />
      </View>
    );
  }

  const today = isoDate(new Date());
  const uri = posterUrl(loaded.details.posterPath, 'w342');
  const blurUri = posterUrl(loaded.details.posterPath, 'w185');
  const watchedKeys = new Set(watched.map(episodeKey));
  const pagerHeight =
    selectedSeason !== null ? pageHeights[selectedSeason] ?? 200 : 200;

  const percent =
    tracked !== null
      ? progressPercent(watched.length, tracked.totalEpisodes)
      : 0;
  const showProgress = tracked !== null && loaded.mediaType === 'tv';
  const upNext = nextToWatch(seasons, watched);
  const progressText =
    upNext !== null ? `Up next · ${progressLabel(upNext)}` : 'All caught up';
  const nextLine =
    loaded.mediaType === 'tv'
      ? formatNextEpisode(loaded.details.nextEpisode, today)
      : null;

  return (
    <Animated.ScrollView
      style={{ opacity: contentOpacity }}
      contentContainerStyle={styles.content}
    >
      <View style={styles.hero}>
        {blurUri !== null && (
          <Image
            source={{ uri: blurUri }}
            style={StyleSheet.absoluteFill}
            blurRadius={12}
          />
        )}
        <View style={styles.heroShade} />

        <View style={styles.heroRow}>
          {uri !== null ? (
            <Image source={{ uri }} style={styles.poster} />
          ) : (
            <View style={[styles.poster, styles.placeholder]} />
          )}
          <View style={styles.heroTexts}>
            <Text style={styles.name} numberOfLines={3}>
              {loaded.details.name}
            </Text>
            <Text style={styles.meta}>{metaLine(loaded)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {loaded.details.overview !== '' && (
          <Text style={styles.overview} numberOfLines={4}>
            {loaded.details.overview}
          </Text>
        )}

        {tracked === null ? (
          <View style={styles.buttons}>
            <Pressable
              style={[styles.button, styles.buttonPrimary]}
              onPress={() => add('watching')}
            >
              <Text style={styles.buttonPrimaryText}>Add to Watching</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => add('watchlist')}>
              <Text style={styles.buttonText}>Add to Watchlist</Text>
            </Pressable>
          </View>
        ) : (
          <StatusFilter onChange={changeStatus} progress={statusProgress} />
        )}

        {showProgress && (
          <View style={styles.progress}>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressLabel}>{progressText}</Text>
              <Text style={styles.progressPercent}>{percent}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${percent}%` }]} />
            </View>
          </View>
        )}

        {nextLine !== null && (
          <View style={styles.nextRow}>
            <MaterialIcons name="event" size={18} color="#a8c7fa" />
            <Text style={styles.nextText}>{nextLine}</Text>
          </View>
        )}
      </View>

      {seasons.length > 0 && selectedSeason !== null && (
        <>
          <ScrollView
            ref={chipRowRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.seasonRow}
            contentContainerStyle={styles.seasonRowContent}
            onLayout={e => {
              chipRowWidth.current = e.nativeEvent.layout.width;
            }}
          >
            {seasons.map((season, i) => {
              const activeOpacity = seasonProgress.interpolate({
                inputRange: [i - 1, i, i + 1],
                outputRange: [0, 1, 0],
                extrapolate: 'clamp',
              });
              return (
                <Pressable
                  key={season.seasonNumber}
                  onLayout={e => {
                    const { x, width } = e.nativeEvent.layout;
                    onChipLayout(season.seasonNumber, { x, width });
                  }}
                  onPress={() => selectSeason(season.seasonNumber)}
                >
                  <View style={styles.seasonButton}>
                    <Text style={styles.seasonText}>
                      Season {season.seasonNumber}
                    </Text>
                    <Animated.View
                      style={[styles.seasonActive, { opacity: activeOpacity }]}
                    >
                      <Text
                        style={[styles.seasonText, styles.seasonActiveText]}
                      >
                        Season {season.seasonNumber}
                      </Text>
                    </Animated.View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <AnimatedPagerView
            ref={pagerRef}
            style={{ height: pagerHeight }}
            initialPage={Math.max(
              0,
              seasons.findIndex(s => s.seasonNumber === selectedSeason),
            )}
            onPageScroll={onPageScroll}
            onPageSelected={e => onPageSelected(e.nativeEvent.position)}
          >
            {seasons.map(season => {
              const seasonEpisodes = episodesBySeason[season.seasonNumber];
              return (
                <View key={season.seasonNumber}>
                  <View
                    onLayout={e => {
                      const height = e.nativeEvent.layout.height;
                      setPageHeights(previous =>
                        previous[season.seasonNumber] === height
                          ? previous
                          : { ...previous, [season.seasonNumber]: height },
                      );
                    }}
                  >
                    {seasonEpisodes === undefined ? (
                      <ActivityIndicator
                        style={styles.seasonSpinner}
                        color="#a8c7fa"
                      />
                    ) : (
                      seasonEpisodes.map(episode => (
                        <EpisodeRow
                          key={episode.episodeNumber}
                          episode={episode}
                          watched={watchedKeys.has(episodeKey(episode))}
                          aired={isAired(episode.airDate, today)}
                          disabled={tracked === null}
                          onToggle={onToggleEpisode}
                        />
                      ))
                    )}
                  </View>
                </View>
              );
            })}
          </AnimatedPagerView>
        </>
      )}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#f28b82',
    textAlign: 'center',
  },
  content: {
    paddingBottom: 32,
  },
  hero: {
    overflow: 'hidden',
  },
  heroShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(18, 19, 24, 0.7)',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
  },
  poster: {
    width: 110,
    aspectRatio: 2 / 3,
    borderRadius: 10,
  },
  placeholder: {
    backgroundColor: '#2c2e36',
  },
  heroTexts: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  meta: {
    color: '#c4c6d0',
    fontSize: 13,
    marginTop: 6,
  },
  body: {
    paddingHorizontal: 16,
  },
  overview: {
    color: '#9a9ca5',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 16,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#a8c7fa',
  },
  buttonPrimary: {
    backgroundColor: '#a8c7fa',
  },
  buttonText: {
    color: '#a8c7fa',
    fontWeight: 'bold',
  },
  buttonPrimaryText: {
    color: '#121318',
    fontWeight: 'bold',
  },
  progress: {
    marginTop: 16,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  progressPercent: {
    color: '#a8c7fa',
    fontWeight: 'bold',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#24262e',
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#a8c7fa',
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#1c1e25',
  },
  nextText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  seasonRow: {
    marginTop: 20,
    marginBottom: 12,
  },
  seasonRowContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  seasonButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#24262e',
    overflow: 'hidden',
  },
  seasonActive: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    backgroundColor: '#a8c7fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seasonText: {
    color: '#9a9ca5',
    fontWeight: 'bold',
  },
  seasonActiveText: {
    color: '#121318',
  },
  seasonSpinner: {
    marginVertical: 24,
  },
});
