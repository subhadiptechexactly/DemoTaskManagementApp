import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Screen from '../../components/Screen';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { fetchTasksStart, fetchTasksSuccess, fetchTasksFailure, Task } from '../../redux/slices/taskSlice';
import { getTasks, getCurrentUserId } from '../../firebase/config';
import { getAllTasksLocal } from '../../storage/offlineRepo';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Define the navigation prop type
type TaskListScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Tasks'>;

interface TaskListScreenProps {
  navigation: TaskListScreenNavigationProp;
}

const TaskListScreen = ({ navigation }: TaskListScreenProps) => {
  const dispatch = useDispatch();
  const { tasks, isLoading } = useSelector((state: any) => state.tasks);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = useCallback(async () => {
    dispatch(fetchTasksStart());
    const uid = getCurrentUserId();
    // Always seed from local Realm first so offline creations are visible
    try {
      const local = await getAllTasksLocal();
      const localTasks: Task[] = local.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        isCompleted: !!t.isCompleted,
        dueDate: t.dueDate,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        userId: t.userId,
      }));
      dispatch(fetchTasksSuccess(localTasks));
    } catch (e) {
      // ignore local load errors here
    }
    // If not authenticated, load from local Realm and exit
    if (!uid) {
      try {
        const local = await getAllTasksLocal();
        const localTasks: Task[] = local.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          isCompleted: !!t.isCompleted,
          dueDate: t.dueDate,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          userId: t.userId,
        }));
        dispatch(fetchTasksSuccess(localTasks));
      } catch (e) {
        dispatch(fetchTasksFailure('Failed to load local tasks'));
      }
      setRefreshing(false);
      return () => {};
    }
    // Set up Firestore subscription
    const unsubscribe = getTasks((rawTasks) => {
      try {
        const remoteTasks: Task[] = rawTasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          isCompleted: !!t.isCompleted,
          dueDate: t.dueDate
            ? (t.dueDate.toDate ? t.dueDate.toDate().toISOString() : t.dueDate)
            : undefined,
          createdAt: t.createdAt?.toDate ? t.createdAt.toDate().toISOString() : (t.createdAt || new Date().toISOString()),
          updatedAt: t.updatedAt?.toDate ? t.updatedAt.toDate().toISOString() : (t.updatedAt || new Date().toISOString()),
          userId: t.userId,
        }));
        dispatch(fetchTasksSuccess(remoteTasks));
      } catch (e) {
        dispatch(fetchTasksFailure('Failed to parse tasks'));
      }
    });
    setRefreshing(false);
    return unsubscribe;
  }, [dispatch]);

  useEffect(() => {
    let unsub: undefined | (() => void);
    (async () => {
      unsub = await loadTasks();
    })();
    return () => {
      if (unsub) unsub();
    };
  }, [loadTasks]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity 
      style={styles.taskItem}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
    >
      <View style={styles.taskContent}>
        <Text 
          style={[styles.taskTitle, item.isCompleted && styles.completedTask]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        {item.description && (
          <Text 
            style={[styles.taskDescription, item.isCompleted && styles.completedTask]}
            numberOfLines={1}
          >
            {item.description}
          </Text>
        )}
      </View>
      <TouchableOpacity 
        style={[styles.checkbox, item.isCompleted && styles.checkboxCompleted]}
        onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
      >
        {item.isCompleted && 
        <Text>Completed</Text>
        }
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1c7ed6" />
      </View>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done" size={48} color="#ddd" />
              <Text style={styles.emptyStateText}>No tasks yet</Text>
              <Text style={styles.emptyStateSubtext}>Tap + to add a new task</Text>
            </View>
          }
        />
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTask', {})}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskContent: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#1c7ed6',
    borderColor: '#1c7ed6',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#999',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1c7ed6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default TaskListScreen;
