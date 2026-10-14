import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { Status, TrackedTitle } from '../domain/types';
import { getAppDb } from '../db/appDb';
import { listTitlesByStatus } from '../db/titles';
import { PosterCard } from './PosterCard';

const NUM_COLUMNS = 4;

export function TitleGrid(props: {
  status: Status;
  refreshKey: number;
  selectedIds: ReadonlySet<number>;
  onPress: (title: TrackedTitle) => void;
  onLongPress: (title: TrackedTitle) => void;
}): React.JSX.Element {
  const { status, refreshKey, selectedIds, onPress, onLongPress } = props;
  const [titles, setTitles] = useState<TrackedTitle[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    async function run() {
      setLoading(true);
      try {
        const db = await getAppDb();
        const rows = await listTitlesByStatus(db, status);
        setTitles(rows);
      } catch (e) {
        console.log('Load failed:', e);
      } finally {
        setLoading(false);
      }
    }
    run();
    // refreshKey is not read here, but a new value must re-run the load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, refreshKey]);

  useFocusEffect(load);

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={titles}
      extraData={selectedIds}
      numColumns={NUM_COLUMNS}
      keyExtractor={item => String(item.id)}
      renderItem={({ item }) => (
        <View style={styles.cell}>
          <PosterCard
            title={item}
            selected={selectedIds.has(item.id)}
            onPress={() => onPress(item)}
            onLongPress={() => onLongPress(item)}
          />
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.infoText}>
          {loading
            ? 'Loading…'
            : 'Nothing here yet. Tap the search bar to add something.'}
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 24,
  },
  cell: {
    flex: 1,
    maxWidth: `${100 / NUM_COLUMNS}%`,
    paddingHorizontal: 1,
    marginBottom: 8,
  },
  infoText: {
    color: '#9a9ca5',
    marginTop: 8,
    marginHorizontal: 6,
  },
});
