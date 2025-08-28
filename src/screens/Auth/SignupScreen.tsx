import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import Screen from '../../components/Screen';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useAppDispatch, useAppSelector, RootState } from '../../redux/store';
import { registerUser } from '../../redux/slices/authSlice';

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
    textAlign: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 8,
    textAlign: 'left',
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
    color: '#2563eb',
    fontWeight: '700',
  },
});

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

const SignupScreen = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  
  // Handle navigation after successful registration
  useEffect(() => {
    if (isAuthenticated) {
      navigation.navigate('App');
    }
  }, [isAuthenticated, navigation]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      setError(null); // Clear error after showing
    }
  }, [error]);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const result = await dispatch(registerUser({ email, password, name })).unwrap();
      if (!result) {
        setError('Registration failed. Please try again.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during registration';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerWrap}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Sign up to get started with your tasks</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Full name</Text>
          <View style={styles.inputRow}>
            <MaterialIcons name="person-outline" size={20} color="#64748b" />
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#9aa4b2"
            />
          </View>

          <Text style={[styles.label, { marginTop: 10 }]}>Email</Text>
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
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#9aa4b2"
            />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
              <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { marginTop: 10 }]}>Confirm password</Text>
          <View style={[styles.inputRow, { marginBottom: 6 }]}>
            <MaterialIcons name="lock-outline" size={20} color="#64748b" />
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              placeholderTextColor="#9aa4b2"
            />
            <TouchableOpacity onPress={() => setShowConfirm(p => !p)}>
              <MaterialIcons name={showConfirm ? 'visibility-off' : 'visibility'} size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, (isLoading || !name || !email || !password || !confirmPassword) && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={isLoading || !name || !email || !password || !confirmPassword}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <MaterialIcons name="person-add" size={20} color="#fff" />
                <Text style={styles.buttonText}>Sign Up</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Login' } as any)}>
            <Text style={styles.footerLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
};


export default SignupScreen;
