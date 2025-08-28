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
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

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

    // Notifications/FCM setup
    (async () => {
      try {
        // Android 13+ runtime permission
        // await notifee.requestPermission();
        // // Ensure a channel exists for message notifications
        // await notifee.createChannel({ id: 'messages', name: 'Messages', importance: AndroidImportance.HIGH });

        // Request FCM permission (iOS) and get token (both platforms)
        await messaging().requestPermission();
        const token = await messaging().getToken();
        console.log('FCM token:', token);
        // TODO: send token to your backend for targeting this device

        // Foreground messages -> show local notification
        const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
          const title = remoteMessage.notification?.title || 'New message';
          const body = remoteMessage.notification?.body || JSON.stringify(remoteMessage.data || {});
          await notifee.displayNotification({
            title,
            body,
            android: { channelId: 'messages', smallIcon: 'ic_launcher', pressAction: { id: 'default' } },
          });
        });

        // When app opened from background by tapping a notification
        const unsubscribeOpened = messaging().onNotificationOpenedApp(async remoteMessage => {
          // Handle navigation if needed using remoteMessage.data
        });

        // When app opened from quit by tapping a notification
        messaging()
          .getInitialNotification()
          .then(async remoteMessage => {
            if (remoteMessage) {
              // Handle deep link/navigation here
            }
          });

        // Token refresh
        const unsubscribeToken = messaging().onTokenRefresh(newToken => {
          console.log('FCM token refreshed:', newToken);
          // TODO: update backend with new token
        });

        // Cleanup
        return () => {
          unsubscribeOnMessage();
          unsubscribeOpened();
          unsubscribeToken();
        };
      } catch (e) {
        // Non-fatal
        console.warn('Notification setup error:', e);
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
