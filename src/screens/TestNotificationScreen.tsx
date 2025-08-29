import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import { testScheduledNotification } from '../notifications/NotificationService';

const TestNotificationScreen = () => {
  const handleTestScheduledNotification = async () => {
    try {
      console.log('Testing scheduled notification...');
      await testScheduledNotification();
      console.log('Scheduled notification test initiated');
    } catch (error) {
      console.error('Error testing scheduled notification:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Test</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Test Scheduled Notification (10s)"
          onPress={handleTestScheduledNotification}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginVertical: 10,
  },
});

export default TestNotificationScreen;
