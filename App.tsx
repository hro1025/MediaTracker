/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { searchTitles } from './src/tmdb/api';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // TEMPORARY (step 4.7): remove after the Check.
  useEffect(() => {
    async function testSearch() {
      try {
        const results = await searchTitles('matrix');
        console.log('TMDB results:', results.length);
      } catch (error) {
        console.log('TMDB error:', error);
      }
    }
    testSearch();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={centerContainer.container}>
        <Text style={centerContainer.Text}>Media Tracker!</Text>
      </View>
    </SafeAreaProvider>
  );
}

const centerContainer = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Text: {
    fontSize: 30,
    color: 'white',
  },
});

export default App;
