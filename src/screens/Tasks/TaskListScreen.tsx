import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { fetchTasksStart, fetchTasksSuccess, fetchTasksFailure, Task } from '../../redux/slices/taskSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Define the navigation prop type
type TaskListScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Tasks'>;

interface TaskListScreenProps {
  navigation: TaskListScreenNavigationProp;
}

const TaskListScreen = ({ navigation }: TaskListScreenProps) => {
  const dispatch = useDispatch();
  const { tasks, isLoading, error } = useSelector((state: any) => state.tasks);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = async () => {
    try {
      dispatch(fetchTasksStart());
      // TODO: Replace with actual API call to fetch tasks
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Complete project setup',
          description: 'Set up the initial project structure and navigation',
          isCompleted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'user-1',
        },
        {
          id: '2',
          title: 'Implement authentication',
          description: 'Set up Firebase authentication',
          isCompleted: false,
          dueDate: '2023-12-31',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'user-1',
        },
      ];
      
      dispatch(fetchTasksSuccess(mockTasks));
    } catch (err) {
      dispatch(fetchTasksFailure('Failed to load tasks'));
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

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
        onPress={() => {}}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
