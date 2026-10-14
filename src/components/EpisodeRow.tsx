import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import type { Episode } from '../domain/types';
import { shortDate } from '../domain/progress';

type Props = {
  episode: Episode;
  watched: boolean;
  aired: boolean;
  disabled: boolean;
  onToggle: (episode: Episode, watched: boolean) => void;
};

function EpisodeRowView(props: Props): React.JSX.Element {
  const { episode, watched, aired, disabled, onToggle } = props;

  let dateText: string;
  if (aired && episode.airDate !== null) {
    dateText = episode.airDate;
  } else if (episode.airDate !== null) {
    dateText = `Airs ${shortDate(episode.airDate) ?? episode.airDate}`;
  } else {
    dateText = 'Not announced yet';
  }

  return (
    <Pressable
      onPress={() => onToggle(episode, watched)}
      disabled={disabled || !aired}
      style={({ pressed }) => [
        styles.card,
        !aired && styles.upcoming,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.numberBox, watched && styles.numberBoxWatched]}>
        <Text style={[styles.number, watched && styles.numberWatched]}>
          {episode.episodeNumber}
        </Text>
      </View>

      <View style={styles.texts}>
        <Text
          style={[styles.name, watched && styles.nameWatched]}
          numberOfLines={1}
        >
          {episode.name}
        </Text>
        <Text style={[styles.date, !aired && styles.dateUpcoming]}>
          {dateText}
        </Text>
      </View>

      {aired ? (
        <View style={disabled && styles.disabled}>
          <MaterialIcons
            name={watched ? 'check-circle' : 'radio-button-unchecked'}
            size={28}
            color={watched ? '#a8c7fa' : '#5c5f6a'}
          />
        </View>
      ) : (
        <MaterialIcons name="schedule" size={24} color="#5c5f6a" />
      )}
    </Pressable>
  );
}

// Only redraw a row when its own props change.
export const EpisodeRow = React.memo(EpisodeRowView);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1e25',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  upcoming: {
    opacity: 0.5,
  },
  pressed: {
    backgroundColor: '#24262e',
  },
  numberBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2c2e36',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberBoxWatched: {
    backgroundColor: '#2a3550',
  },
  number: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  numberWatched: {
    color: '#a8c7fa',
  },
  texts: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    color: '#ffffff',
    fontSize: 15,
  },
  nameWatched: {
    color: '#7d808a',
  },
  date: {
    color: '#7d808a',
    fontSize: 12,
    marginTop: 3,
  },
  dateUpcoming: {
    color: '#a8c7fa',
  },
  disabled: {
    opacity: 0.3,
  },
});
