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
import { initNotifications, showFCMNotification, REMINDER_CHANNEL_ID } from './src/notifications/NotificationService';
import notifee from '@notifee/react-native';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'AsyncStorage has been extracted from react-native core',
]);

const ThemedStatusBar = () => {
  const { theme } = useTheme();
  return (
    <StatusBar
      barStyle={theme.dark ? 'light-content' : 'dark-content'}
      backgroundColor={theme.colors.background}
    />
  );
};

const App = () => {
  useEffect(() => {
    // Open Realm and process any pending offline operations
    (async () => {
      try {
        await ensureRealm();
        await processQueue();
      } catch (e) {
        console.warn('Error initializing offline storage:', e);
      }
    })();

    // Initialize notifications
    const initializeNotifications = async () => {
      try {
        // Initialize notifications
        await initNotifications();
        
        // Check notification settings
        const settings = await notifee.getNotificationSettings();
        console.log('Notification settings:', settings);
        
        // Check channel
        const channel = await notifee.getChannel(REMINDER_CHANNEL_ID);
        console.log('Reminder channel:', channel);
        
        // When app is in foreground
        const onMessageUnsubscribe = messaging().onMessage(async remoteMessage => {
          await showFCMNotification(remoteMessage);
        });

        // When app opened from background by tapping a notification
        const onNotificationOpenedUnsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
          console.log('Notification opened from background:', remoteMessage);
        });

        // When app opened from quit by tapping a notification
        messaging().getInitialNotification().then(remoteMessage => {
          if (remoteMessage) {
            console.log('Notification opened from quit state:', remoteMessage);
          }
        });

        // Token refresh
        const onTokenRefreshUnsubscribe = messaging().onTokenRefresh(newToken => {
          console.log('FCM token refreshed:', newToken);
          // TODO: update backend with new token
        });

        // Cleanup function
        return () => {
          onMessageUnsubscribe();
          onNotificationOpenedUnsubscribe();
          onTokenRefreshUnsubscribe();
        };
      } catch (e) {
        console.warn('Notification setup error:', e);
      }
    };

    // Setup periodic background sync
    const syncInterval = setInterval(() => {
      processQueue().catch(e => console.warn('Background sync error:', e));
    }, 30000);

    // Initialize notifications
    const notificationCleanup = initializeNotifications();

    // Cleanup function
    return () => {
      clearInterval(syncInterval);
      if (notificationCleanup && typeof notificationCleanup.then === 'function') {
        notificationCleanup.then(cleanupFn => {
          if (typeof cleanupFn === 'function') cleanupFn();
        });
      }
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

export default App;
