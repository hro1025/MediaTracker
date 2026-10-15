import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { getAppDb } from './src/db/appDb';
import { getSetting } from './src/db/settings';
import { setTmdbToken } from './src/tmdb/client';

const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#121318',
    card: '#121318',
  },
};

function App(): React.JSX.Element {
  const [ready, setReady] = useState(false);

  // Load the user's TMDB token before the first screen appears.
  useEffect(() => {
    async function start() {
      try {
        const db = await getAppDb();
        setTmdbToken(await getSetting(db, 'tmdbToken'));
      } catch (e) {
        console.log('Could not load the TMDB token:', e);
      } finally {
        setReady(true);
      }
    }
    start();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      {ready ? (
        <NavigationContainer theme={AppTheme}>
          <RootNavigator />
        </NavigationContainer>
      ) : (
        <View style={styles.splash} />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#121318',
  },
});

export default App;
