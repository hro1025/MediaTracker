import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { TrackedTitle } from '../domain/types';
import { progressBadge } from '../domain/progress';
import { posterUrl } from '../tmdb/images';
import { ProgressBadge } from './ProgressBadge';

export function PosterCard(props: {
  title: TrackedTitle;
  selected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}): React.JSX.Element {
  const { title, selected, onPress, onLongPress } = props;
  const uri = posterUrl(title.posterPath, 'w342');

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={[styles.imageWrapper, selected && styles.dimmed]}>
        {uri !== null ? (
          <Image source={{ uri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText} numberOfLines={3}>
              {title.name}
            </Text>
          </View>
        )}
        <View style={styles.badge}>
          <ProgressBadge badge={progressBadge(title)} />
        </View>
      </View>
      <Text
        style={[styles.name, selected && styles.nameSelected]}
        numberOfLines={2}
      >
        {title.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 4,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#a8c7fa',
    backgroundColor: '#2a3550',
  },
  imageWrapper: {
    position: 'relative',
  },
  dimmed: {
    opacity: 0.6,
  },
  image: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 10,
  },
  placeholder: {
    backgroundColor: '#2c2e36',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  placeholderText: {
    color: '#9a9ca5',
    fontSize: 12,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  name: {
    color: '#ffffff',
    fontSize: 13,
    marginTop: 6,
  },
  nameSelected: {
    color: '#9a9ca5',
  },
});
