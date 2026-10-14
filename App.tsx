import { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getAppDb } from './src/db/appDb';

function App() {
  // TEMPORARY (step 5.7): remove after the check
  useEffect(() => {
    async function testDb() {
      try {
        const db = await getAppDb();
        const result = await db.execute('SELECT COUNT(*) AS n FROM titles');
        console.log('Titles:', result.rows[0]);
      } catch (e) {
        console.log('DB error:', e);
      }
    }
    testDb();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Media Tracker!</Text>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
  },
});

export default App;
