/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { onMessageReceived } from './src/notifications/HeadlessTask';
import App from './App';
import { name as appName } from './app.json';

// Register the main application component
AppRegistry.registerComponent(appName, () => App);

// Register headless task for handling notifications when app is in killed state
messaging().setBackgroundMessageHandler(onMessageReceived);

// Handle notification events when app is in background
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification } = detail;
  
  if (type === EventType.PRESS) {
    // Handle notification press in background
    console.log('Notification pressed in background:', notification);
  }
});

// Initialize notification channels
async function initializeNotifications() {
  try {
    // Create default channels
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
    
    await notifee.createChannel({
      id: 'messages',
      name: 'Messages',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
    
    console.log('Notification channels initialized');
  } catch (error) {
    console.error('Failed to initialize notification channels:', error);
  }
}

// Initialize notifications when the app starts
initializeNotifications();
