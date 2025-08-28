/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/redux/store';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/contexts/AuthContext';
import { ensureRealm, processQueue } from './src/storage/offlineRepo';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'AsyncStorage has been extracted from react-native core',
]);

const App = () => {
  useEffect(() => {
    // Open Realm and process any pending offline operations
    (async () => {
      try {
        await ensureRealm();
        await processQueue();
      } catch (e) {
        // noop
      }
    })();
    // Periodic background sync
    const interval = setInterval(() => {
      processQueue();
    }, 30000);
    
    // Set up any app-wide listeners or subscriptions here
    return () => {
      // Clean up any subscriptions
      clearInterval(interval);
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <ThemedStatusBar />
              <RootNavigator />
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
};

const ThemedStatusBar = () => {
  const { theme, isDark } = useTheme();
  return (
    <StatusBar
      barStyle={isDark ? 'light-content' : 'dark-content'}
      backgroundColor={theme.colors.background}
    />
  );
};

export default App;
