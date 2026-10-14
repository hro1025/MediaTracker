import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

export function AboutScreen(_props: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.appName}>Media Tracker</Text>
      <Text style={styles.text}>
        Track the movies, series and anime you watch.
      </Text>

      <Text style={styles.heading}>Credits</Text>
      <Image
        source={require('../../assets/tmdb-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.text}>
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  appName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  heading: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 12,
  },
  logo: {
    height: 20,
    width: 150,
  },
  text: {
    color: '#9a9ca5',
    fontSize: 14,
    marginTop: 8,
  },
});
