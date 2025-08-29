/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

// Handle background/quit state FCM messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
  try {
    // Ensure channel exists in headless/background too
    await notifee.createChannel({ id: 'messages', name: 'Messages', importance: AndroidImportance.HIGH });
    const title = remoteMessage.notification?.title || 'New message';
    const body = remoteMessage.notification?.body || JSON.stringify(remoteMessage.data || {});
    await notifee.displayNotification({
      title,
      body,
      android: { channelId: 'messages', smallIcon: 'ic_launcher', pressAction: { id: 'default' } },
    });
  } catch (e) {
    // ignore
  }
});
