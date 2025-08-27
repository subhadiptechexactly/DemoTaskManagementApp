import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthResponse {
  success: boolean;
  user: UserProfile | null;
  token?: string;
  error?: string;
}

export const signUpWithEmail = async (email: string, password: string, name: string): Promise<AuthResponse> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    if (!user) {
      throw new Error('Failed to create user');
    }

    // Store additional user data in Firestore
    await firestore().collection('users').doc(user.uid).set({
      email,
      displayName: name,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    // Update user profile with display name
    await user.updateProfile({
      displayName: name,
    });

    const token = await user.getIdToken();
    return { 
      success: true, 
      user: { 
        uid: user.uid, 
        email: user.email, 
        displayName: name 
      }, 
      token 
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    return { 
      success: false, 
      user: null,
      error: error.message || 'Failed to create account. Please try again.' 
    };
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    if (!userCredential.user) {
      throw new Error('No user found');
    }
    const token = await userCredential.user.getIdToken();
    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
      },
      token,
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return { 
      success: false, 
      user: null,
      error: error.message || 'Failed to sign in. Please check your credentials.' 
    };
  }
};

export const signOut = async (): Promise<AuthResponse> => {
  try {
    await auth().signOut();
    return { 
      success: true, 
      user: null 
    };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { 
      success: false, 
      user: null,
      error: error.message || 'Failed to sign out' 
    };
  }
};

export const getCurrentUser = (): FirebaseAuthTypes.User | null => {
  return auth().currentUser;
};

export const onAuthStateChanged = (callback: (user: any) => void) => {
  return auth().onAuthStateChanged(callback);
};
