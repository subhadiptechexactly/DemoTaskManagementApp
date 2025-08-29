import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, TimestampTrigger, TriggerType } from '@notifee/react-native';

// Channel IDs
export const FCM_CHANNEL_ID = 'messages';
export const REMINDER_CHANNEL_ID = 'tasks-reminders';

// Initialize permissions and channels at app start
export async function initNotifications() {
  try {
    console.log('Initializing notifications...');
    
    // Request notification permission (Android 13+, iOS)
    const permission = await notifee.requestPermission();
    console.log('Notification permission status:', permission);
    
    // Request FCM permission
    await messaging().requestPermission();

    // Create channels with detailed configuration
    const fcmChannel = await notifee.createChannel({ 
      id: FCM_CHANNEL_ID, 
      name: 'Messages', 
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      vibrationPattern: [300, 500],
      lights: true,
      lightColor: '#FF0000',
    });
    
    console.log('FCM channel created:', fcmChannel);
    
    const reminderChannel = await notifee.createChannel({
      id: REMINDER_CHANNEL_ID,
      name: 'Task Reminders',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      vibrationPattern: [300, 500],
      lights: true,
      lightColor: '#FF0000',
      bypassDnd: true,
    });
    
    console.log('Reminder channel created:', reminderChannel);
    
    // Log current notification settings
    const settings = await notifee.getNotificationSettings();
    console.log('Current notification settings:', settings);
    
    return true;
  } catch (e) {
    console.error('initNotifications error:', e);
    return false;
  }
}

// Show a notification for an incoming foreground FCM message
export async function showFCMNotification(remoteMessage: any) {
  try {
    await notifee.createChannel({ id: FCM_CHANNEL_ID, name: 'Messages', importance: AndroidImportance.HIGH });
    const title = remoteMessage?.notification?.title || 'New message';
    const body = remoteMessage?.notification?.body || JSON.stringify(remoteMessage?.data || {});
    await notifee.displayNotification({
      title,
      body,
      android: { channelId: FCM_CHANNEL_ID, pressAction: { id: 'default' } },
    });
  } catch (e) {
    console.warn('showFCMNotification error:', e);
  }
}

// Test scheduled notification that will trigger in 10 seconds
export async function testScheduledNotification() {
  try {
    // Ensure we have the required permissions
    await notifee.requestPermission();
    
    // Create the channel if it doesn't exist
    await notifee.createChannel({
      id: REMINDER_CHANNEL_ID,
      name: 'Task Reminders',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      vibrationPattern: [300, 500],
    });

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + 10000, // 10 seconds from now
      alarmManager: { 
        allowWhileIdle: true,
      },
    };

    // Cancel any existing test notification to avoid duplicates
    await notifee.cancelNotification('test-scheduled-notification');

    // Schedule the notification
    await notifee.createTriggerNotification(
      {
        id: 'test-scheduled-notification',
        title: 'Scheduled Test',
        body: 'This is a test notification that was scheduled 10 seconds ago',
        android: {
          channelId: REMINDER_CHANNEL_ID,
          pressAction: { 
            id: 'default',
            launchActivity: 'default',
          },
          importance: AndroidImportance.HIGH,
          smallIcon: 'ic_launcher',
          color: '#FF0000',
          timestamp: Date.now() + 10000,
          showTimestamp: true,
          autoCancel: true,
          ongoing: false,
        },
      },
      trigger,
    );

    console.log('Test scheduled notification set to show in 10 seconds');
    console.log('Scheduled time:', new Date(Date.now() + 10000).toISOString());
    
    // List all pending notifications
    const pending = await notifee.getTriggerNotifications();
    console.log('Pending notifications after scheduling test:', pending.map(p => ({
      id: p.notification.id,
      title: p.notification.title,
      trigger: p.trigger,
    })));
    
    return true;
  } catch (e) {
    console.warn('testScheduledNotification error:', e);
    return false;
  }
}


// Schedule a local reminder for a task
export async function scheduleTaskReminder(taskId: string, title: string, date: Date | null, time: Date | null) {
  if (!date || !time) {
    console.log('scheduleTaskReminder: Missing date or time');
    return false;
  }
  
  try {
    const scheduled = new Date(date);
    scheduled.setHours(time.getHours(), time.getMinutes(), 0, 0);
    const now = Date.now();
    const scheduledTime = scheduled.getTime();
    
    console.log('Scheduling task notification:', {
      taskId,
      title,
      scheduled: new Date(scheduledTime).toISOString(),
      now: new Date(now).toISOString(),
      inFuture: scheduledTime > now + 2000
    });
    
    if (scheduledTime <= now + 2000) {
      console.log('Skipping: Scheduled time is in the past or too soon');
      return false;
    }

    // Request notification permissions
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus < 1) {
      console.warn('Notification permission denied');
      return false;
    }

    // Create or update the notification channel
    await notifee.createChannel({
      id: REMINDER_CHANNEL_ID,
      name: 'Task Reminders',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      vibrationPattern: [300, 500],
    });

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: scheduledTime,
      alarmManager: { 
        allowWhileIdle: true,
      },
    };

    // Create a full-featured notification
    const notification = {
      id: `task-${taskId}`,
      title: 'Task Reminder',
      body: title,
      data: { 
        taskId, 
        type: 'reminder',
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        channelId: REMINDER_CHANNEL_ID,
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        smallIcon: 'ic_launcher',
        color: '#4a86e8',
        timestamp: scheduledTime,
        showTimestamp: true,
        showWhen: true,
        autoCancel: true,
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [300, 500],
        lights: ['#FF0000', 300, 600] as [string, number, number],
        groupSummary: true,
        groupId: 'task_reminders',
      },
    };
    
    console.log('Creating notification with:', JSON.stringify(notification, null, 2));
    
    await notifee.createTriggerNotification(notification, trigger);
    
    console.log('Successfully scheduled notification for task:', taskId);
    
    // Debug: List all pending notifications
    const pending = await notifee.getTriggerNotifications();
    console.log('Current pending notifications:', pending.map(p => ({
      id: p.notification.id,
      title: p.notification.title,
      body: p.notification.body,
      trigger: p.trigger,
    })));
  } catch (e) {
    console.warn('scheduleTaskReminder error:', e);
  }
}

export async function cancelTaskReminder(taskId: string) {
  try {
    await notifee.cancelTriggerNotification(`task-${taskId}`);
  } catch (e) {
    // ignore
  }
}

// List all pending notifications for debugging
export async function listPendingNotifications() {
  try {
    const notifications = await notifee.getTriggerNotifications();
    console.log('=== Pending Notifications ===');
    console.log(`Total: ${notifications.length}`);
    
    notifications.forEach((notification, index) => {
      console.log(`\n[${index + 1}] ID: ${notification.notification.id}`);
      console.log(`Title: ${notification.notification.title}`);
      console.log(`Body: ${notification.notification.body}`);
      console.log('Trigger:', notification.trigger);
      console.log('Notification:', notification.notification);
    });
    
    return notifications;
  } catch (e) {
    console.error('Error listing pending notifications:', e);
    return [];
  }
}

// Optional: one-off immediate display for debugging channels
export async function showImmediate(title: string, body: string) {
  try {
    await notifee.createChannel({ id: REMINDER_CHANNEL_ID, name: 'Task Reminders', importance: AndroidImportance.HIGH });
    await notifee.displayNotification({
      title,
      body,
      android: { channelId: REMINDER_CHANNEL_ID },
    });
  } catch (e) {
    console.warn('showImmediate error:', e);
  }
}
