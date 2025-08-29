import messaging from '@react-native-firebase/messaging';
import notifee, { Event, EventType } from '@notifee/react-native';
import { AppState } from 'react-native';

// This function will be called when the app is in a killed state
export async function onMessageReceived(remoteMessage: any) {
  console.log('Message handled in headless task!', remoteMessage);
  
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    sound: 'default',
    importance: 4, // IMPORTANCE_HIGH
  });

  // Display a notification
  await notifee.displayNotification({
    title: remoteMessage.notification?.title || 'New Task Reminder',
    body: remoteMessage.notification?.body,
    android: {
      channelId,
      pressAction: {
        id: 'default',
        launchActivity: 'default',
      },
      smallIcon: 'ic_notification',
      color: '#4a86e8',
    },
    data: remoteMessage.data || {},
  });
}

// Register the headless task
messaging().setBackgroundMessageHandler(onMessageReceived);

// Handle background events
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification } = detail;
  console.log('Background event:', type, notification);
  
  if (type === EventType.PRESS) {
    // Handle notification press
    console.log('Notification pressed in background:', notification);
  }
});
