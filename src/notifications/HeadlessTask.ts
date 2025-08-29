import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

// This function will be called when the app is in a killed state
export async function onMessageReceived(remoteMessage: any) {
  try {
    console.log('Message handled in headless task!', remoteMessage);
    
    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });

    // Display a notification
    await notifee.displayNotification({
      title: remoteMessage.notification?.title || 'New Task Reminder',
      body: remoteMessage.notification?.body,
      data: remoteMessage.data || {},
      android: {
        channelId,
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        smallIcon: 'ic_notification',
        color: '#4a86e8',
        importance: AndroidImportance.HIGH,
      },
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error in onMessageReceived:', error);
    return Promise.reject(error);
  }
}

// Register the headless task
// @ts-ignore - This is a special React Native import
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
