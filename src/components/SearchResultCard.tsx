import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { SearchResult } from '../domain/types';
import { posterUrl } from '../tmdb/images';

export function SearchResultCard(props: {
  result: SearchResult;
  onPress: () => void;
}): React.JSX.Element {
  const { result, onPress } = props;
  const uri = posterUrl(result.posterPath, 'w185');
  const type = result.mediaType === 'movie' ? 'Movie' : 'Series';
  const subtitle = result.year !== null ? `${result.year} · ${type}` : type;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {uri !== null ? (
        <Image source={{ uri }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText} numberOfLines={3}>
            {result.name}
          </Text>
        </View>
      )}
      <View style={styles.caption}>
        <Text style={styles.name} numberOfLines={1}>
          {result.name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#24262e',
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 2 / 3,
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
  caption: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  name: {
    color: '#ffffff',
    fontSize: 13,
  },
  subtitle: {
    color: '#9a9ca5',
    fontSize: 11,
    marginTop: 2,
  },
});
