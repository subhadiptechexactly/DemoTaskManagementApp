import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface AuthResponse {
  success: boolean;
  user?: any; // Consider replacing 'any' with a proper User type
  error?: string;
}

export const signUpWithEmail = async (email: string, password: string, name: string): Promise<AuthResponse> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    if (!user) {
      return { success: false, error: 'Failed to create user account' };
    }

    // Create user document in Firestore
    await firestore().collection('users').doc(user.uid).set({
      email: user.email,
      displayName: name,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    // Update user profile with display name
    await user.updateProfile({
      displayName: name,
    });

    return { success: true, user };
  } catch (error: any) {
    console.error('Signup error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create account. Please try again.' 
    };
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to sign in. Please check your credentials.' 
    };
  }
};

export const signOut = async (): Promise<AuthResponse> => {
  try {
    await auth().signOut();
    return { success: true };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to sign out. Please try again.' 
    };
  }
};

export const getCurrentUser = () => {
  return auth().currentUser;
};

export const onAuthStateChanged = (callback: (user: any) => void) => {
  return auth().onAuthStateChanged(callback);
};
