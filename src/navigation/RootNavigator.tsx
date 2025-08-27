import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

// Define the auth state type
type AuthState = {
  user: any; // Replace 'any' with your user type
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

// Define the root stack param list
export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const authState = useSelector((state: RootState) => state.auth as AuthState);
  const isAuthenticated = authState.isAuthenticated;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="App" component={AppStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
