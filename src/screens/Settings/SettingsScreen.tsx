import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useAppDispatch, useAppSelector, RootState } from '../../redux/store';
import { setTheme, toggleTheme, setNotificationsEnabled, setSyncOnCellular, resetSettings } from '../../redux/slices/settingsSlice';
import { logoutUser } from '../../redux/slices/authSlice';

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { theme, notificationsEnabled, syncOnCellular } = useAppSelector((state: RootState) => state.settings);
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');

  const handleThemeToggle = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    dispatch(setTheme(newTheme));
  };

  const handleNotificationsToggle = (value: boolean) => {
    dispatch(setNotificationsEnabled(value));
  };

  const handleSyncOnCellularToggle = (value: boolean) => {
    dispatch(setSyncOnCellular(value));
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            dispatch(resetSettings());
            setIsDarkMode(false);
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logoutUser()).unwrap();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    description, 
    onPress, 
    showSwitch = false, 
    switchValue = false, 
    onSwitchChange = () => {},
    isLast = false 
  }: {
    icon: string;
    title: string;
    description: string;
    onPress?: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    isLast?: boolean;
  }) => (
    <TouchableOpacity 
      style={[styles.settingItem, !isLast && styles.borderBottom]}
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={styles.settingIconContainer}>
        {/* <Ionicons name={icon as any} size={22} color="#1c7ed6" /> */}
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#e9ecef', true: '#d0ebff' }}
          thumbColor={switchValue ? '#1c7ed6' : '#f8f9fa'}
        />
      ) : (
        // <Ionicons name="chevron-forward" size={20} color="#adb5bd" />
        <Text>COMPLETE</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <SettingItem
            icon="moon"
            title="Dark Mode"
            description="Enable dark theme"
            showSwitch
            switchValue={isDarkMode}
            onSwitchChange={handleThemeToggle}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingItem
            icon="notifications"
            title="Enable Notifications"
            description="Receive task reminders and updates"
            showSwitch
            switchValue={notificationsEnabled}
            onSwitchChange={handleNotificationsToggle}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Sync</Text>
          <SettingItem
            icon="sync"
            title="Sync on Cellular"
            description="Allow syncing when not on Wi-Fi"
            showSwitch
            switchValue={syncOnCellular}
            onSwitchChange={handleSyncOnCellularToggle}
          />
          <SettingItem
            icon="cloud-upload"
            title="Backup & Restore"
            description="Manage your data backup"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem
            icon="person"
            title="Account Settings"
            description="Update your profile and preferences"
          />
          <SettingItem
            icon="shield-checkmark"
            title="Privacy"
            description="Manage your privacy settings"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingItem
            icon="information-circle"
            title="About TaskMaster"
            description="Version 1.0.0"
          />
          <SettingItem
            icon="help-circle"
            title="Help & Support"
            description="Get help with the app"
          />
          <SettingItem
            icon="share-social"
            title="Share App"
            description="Tell your friends about TaskMaster"
          />
          <SettingItem
            icon="thumbs-up"
            title="Rate Us"
            description="Enjoying the app? Rate us!"
          />
        </View>

        <View style={styles.section}>
          <SettingItem
            icon="refresh"
            title="Reset Settings"
            description="Reset all settings to default"
            onPress={handleResetSettings}
            isLast={true}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          {/* <Ionicons name="log-out" size={20} color="#f03e3e" /> */}
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>TaskMaster v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2023 TaskMaster. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#868e96',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e7f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#343a40',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#868e96',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ffc9c9',
  },
  logoutText: {
    color: '#f03e3e',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#868e96',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#adb5bd',
  },
});

export default SettingsScreen;
