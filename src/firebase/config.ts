import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Firebase configuration from google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyAVTWUC45n50Y8lyGozdtvaka5EgUX2_TY",
  authDomain: "taskmanagementapp-95a3c.firebaseapp.com",
  projectId: "taskmanagementapp-95a3c",
  storageBucket: "taskmanagementapp-95a3c.firebasestorage.app",
  messagingSenderId: "1015470159829",
  appId: "1:1015470159829:android:05e15b9b76ff4ca9496f5c",
  databaseURL: "https://taskmanagementapp-95a3c-default-rtdb.firebaseio.com"
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
