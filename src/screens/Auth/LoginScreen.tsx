import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import Screen from '../../components/Screen';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useAppDispatch, useAppSelector, RootState } from '../../redux/store';
import { loginUser } from '../../redux/slices/authSlice';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  // Handle navigation after successful login
  useEffect(() => {
    if (isAuthenticated) {
      navigation.navigate('App');
    }
  }, [isAuthenticated, navigation]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    dispatch(loginUser({ email, password }));
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.headerWrap}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue managing your tasks</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputRow}>
            <MaterialIcons name="mail-outline" size={20} color="#64748b" />
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#9aa4b2"
            />
          </View>

          <Text style={[styles.label, { marginTop: 10 }]}>Password</Text>
          <View style={styles.inputRow}>
            <MaterialIcons name="lock-outline" size={20} color="#64748b" />
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#9aa4b2"
            />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
              <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <MaterialIcons name="login" size={20} color="#fff" />
                <Text style={styles.buttonText}>Sign In</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Signup' } as any)}>
            <Text style={styles.footerLink}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f6f7fb',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'left',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 18,
  },
  headerWrap: {
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 0,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 0,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 6,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 14,
    height: 48,
  },
  inputFlex: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
  },
  footerLink: {
    color: '#1c7ed6',
    fontWeight: '600',
    marginLeft: 4,
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default LoginScreen;
