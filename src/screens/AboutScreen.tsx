import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getAppDb } from '../db/appDb';
import { deleteSetting, setSetting } from '../db/settings';
import {
  describeTmdbError,
  hasTmdbToken,
  setTmdbToken,
  getTmdbToken,
  tmdbGet,
} from '../tmdb/client';
import { clearCache } from '../tmdb/cache';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

type TokenState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'saved' }
  | { kind: 'removed' }
  | { kind: 'error'; message: string };

const REPO_URL = 'https://github.com/hro1025/MediaTracker';
const TMDB_API_SETTINGS_URL = 'https://www.themoviedb.org/settings/api';

function openLink(url: string) {
  Linking.openURL(url).catch(e => {
    console.log('Could not open link:', e);
  });
}

export function AboutScreen(_props: Props): React.JSX.Element {
  const [input, setInput] = useState('');
  const [hasToken, setHasToken] = useState(hasTmdbToken());
  const [state, setState] = useState<TokenState>({ kind: 'idle' });

  async function saveToken(): Promise<void> {
    const value = input.trim();
    if (value === '') {
      return;
    }
    setState({ kind: 'checking' });

    const previousToken = getTmdbToken();
    setTmdbToken(value);
    clearCache();

    try {
      await tmdbGet('/authentication');
      const db = await getAppDb();
      await setSetting(db, 'tmdbToken', value);
      setInput('');
      setHasToken(true);
      setState({ kind: 'saved' });
    } catch (e) {
      // Keep the old token working if the new one is wrong.
      setTmdbToken(previousToken);
      clearCache();
      setState({ kind: 'error', message: describeTmdbError(e) });
    }
  }

  async function removeToken() {
    try {
      const db = await getAppDb();
      await deleteSetting(db, 'tmdbToken');
      setTmdbToken(null);
      clearCache();
      setHasToken(false);
      setState({ kind: 'removed' });
    } catch (e) {
      console.log('Could not remove token:', e);
    }
  }

  const saveDisabled = input.trim() === '' || state.kind === 'checking';

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.appLogo}
        />
        <View style={styles.headerTexts}>
          <Text style={styles.appName}>Media Tracker</Text>
          <Text style={styles.text}>
            Track the movies, series and anime you watch.
          </Text>
        </View>
      </View>

      <Text style={styles.heading}>TMDB token</Text>
      <Text style={styles.text}>
        Media Tracker uses your own free TMDB API Read Access Token. It is
        stored only on this phone.
      </Text>

      <View style={styles.tokenStatus}>
        <MaterialIcons
          name={hasToken ? 'check-circle' : 'error-outline'}
          size={18}
          color={hasToken ? '#a8c7fa' : '#f28b82'}
        />
        <Text style={styles.tokenStatusText}>
          {hasToken ? 'Token saved' : 'No token yet'}
        </Text>
      </View>

      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Paste your API Read Access Token"
        placeholderTextColor="#6b6d76"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.tokenButtons}>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            saveDisabled && styles.buttonDisabled,
            pressed && styles.pressed,
          ]}
          onPress={saveToken}
          disabled={saveDisabled}
        >
          {state.kind === 'checking' ? (
            <ActivityIndicator color="#121318" />
          ) : (
            <Text style={styles.saveText}>Save token</Text>
          )}
        </Pressable>
        {hasToken && (
          <Pressable
            style={({ pressed }) => [
              styles.removeButton,
              pressed && styles.pressed,
            ]}
            onPress={removeToken}
          >
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        )}
      </View>

      {state.kind === 'saved' && (
        <Text style={styles.okText}>Token checked and saved.</Text>
      )}
      {state.kind === 'removed' && (
        <Text style={styles.text}>Token removed.</Text>
      )}
      {state.kind === 'error' && (
        <Text style={styles.errorText}>{state.message}</Text>
      )}

      <Pressable
        style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
        onPress={() => openLink(TMDB_API_SETTINGS_URL)}
      >
        <MaterialIcons name="vpn-key" size={22} color="#a8c7fa" />
        <Text style={styles.linkText} numberOfLines={1}>
          Get a token on themoviedb.org
        </Text>
        <MaterialIcons name="open-in-new" size={18} color="#9a9ca5" />
      </Pressable>

      <Text style={styles.heading}>Source code</Text>
      <Pressable
        style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
        onPress={() => openLink(REPO_URL)}
      >
        <MaterialIcons name="code" size={22} color="#a8c7fa" />
        <Text style={styles.linkText} numberOfLines={1}>
          {REPO_URL.replace('https://', '')}
        </Text>
        <MaterialIcons name="open-in-new" size={18} color="#9a9ca5" />
      </Pressable>

      <Text style={styles.heading}>Credits</Text>
      <Image
        source={require('../../assets/tmdb-logo.png')}
        style={styles.tmdbLogo}
        resizeMode="contain"
      />
      <Text style={styles.text}>
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appLogo: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  headerTexts: {
    flex: 1,
    marginLeft: 16,
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
    marginBottom: 4,
  },
  text: {
    color: '#9a9ca5',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  tokenStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  tokenStatusText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  input: {
    marginTop: 12,
    height: 52,
    backgroundColor: '#1c1e25',
    borderRadius: 14,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 15,
  },
  tokenButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  saveButton: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#a8c7fa',
  },
  saveText: {
    color: '#121318',
    fontWeight: 'bold',
  },
  removeButton: {
    height: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#2c2e36',
  },
  removeText: {
    color: '#f28b82',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
  okText: {
    color: '#a8c7fa',
    marginTop: 8,
  },
  errorText: {
    color: '#f28b82',
    marginTop: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    backgroundColor: '#1c1e25',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  linkText: {
    flex: 1,
    color: '#a8c7fa',
    fontSize: 14,
  },
  tmdbLogo: {
    height: 20,
    width: 150,
    marginTop: 8,
  },
});
