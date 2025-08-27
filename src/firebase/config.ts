import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  // Replace these with your actual Firebase config
  // You can find these in your Firebase Console > Project Settings > General > Your apps
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app, auth, firestore };

export const initFirebase = async () => {
  try {
    // Initialize Firebase if not already initialized
    if (!app) {
      initializeApp(firebaseConfig);
    }
    
    // Enable offline persistence
    await firestore().settings({
      persistence: true,
      cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
    });
    
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
};

// Auth helper functions
export const signInWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signUpWithEmailAndPassword = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    await userCredential.user?.updateProfile({ displayName });
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signOut = async () => {
  try {
    await auth().signOut();
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Firestore helper functions
export const addTask = async (task: any) => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const taskRef = await firestore()
      .collection('users')
      .doc(user.uid)
      .collection('tasks')
      .add({
        ...task,
        userId: user.uid,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      
    return { id: taskRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateTask = async (taskId: string, updates: any) => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error('User not authenticated');
    
    await firestore()
      .collection('users')
      .doc(user.uid)
      .collection('tasks')
      .doc(taskId)
      .update({
        ...updates,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error('User not authenticated');
    
    await firestore()
      .collection('users')
      .doc(user.uid)
      .collection('tasks')
      .doc(taskId)
      .delete();
      
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getTasks = (onTasksUpdate: (tasks: any[]) => void) => {
  const user = auth().currentUser;
  if (!user) return () => {};
  
  const unsubscribe = firestore()
    .collection('users')
    .doc(user.uid)
    .collection('tasks')
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (querySnapshot) => {
        const tasks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        onTasksUpdate(tasks);
      },
      (error) => {
        console.error('Error getting tasks:', error);
      }
    );
    
  return unsubscribe;
};
