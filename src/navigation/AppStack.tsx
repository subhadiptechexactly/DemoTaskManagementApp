import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';
import TaskListScreen from '../screens/Tasks/TaskListScreen';
import TaskDetailScreen from '../screens/Tasks/TaskDetailScreen';
import AddTaskScreen from '../screens/Tasks/AddTaskScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

export type AppStackParamList = {
  Tasks: undefined;
  TaskDetail: { taskId: string };
  AddTask: { taskId?: string };
  Settings: undefined;
  TaskList: undefined;
};

const Tab = createBottomTabNavigator<AppStackParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

const TaskStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Tasks" component={TaskListScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} />
    </Stack.Navigator>
  );
};

const AppStack = () => {
  const theme = useSelector((state: RootState) => state.settings.theme);
  const isDark = theme === 'dark';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Tasks') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'list';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: isDark ? '#4dabf7' : '#1c7ed6',
        tabBarInactiveTintColor: isDark ? '#868e96' : '#495057',
        tabBarStyle: {
          backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
          borderTopColor: isDark ? '#333' : '#e9ecef',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Tasks" component={TaskStack} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default AppStack;
