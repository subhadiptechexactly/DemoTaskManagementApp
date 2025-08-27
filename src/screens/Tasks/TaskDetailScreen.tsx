import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Screen from '../../components/Screen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { useDispatch, useSelector } from 'react-redux';
import { Task, toggleTaskCompletion, deleteTask } from '../../redux/slices/taskSlice';

import { format } from 'date-fns';

type Props = NativeStackScreenProps<AppStackParamList, 'TaskDetail'>;

const TaskDetailScreen = ({ route, navigation }: Props) => {
  const { taskId } = route.params;
  const dispatch = useDispatch();
  
  // Get the task from the Redux store
  const task = useSelector((state: any) => 
    state.tasks.tasks.find((t: Task) => t.id === taskId)
  );

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set the header title to the task title
    if (task) {
      navigation.setOptions({
        title: task.title,
        headerRight: () => (
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleEditPress}
          >
            {/* <Ionicons name="create-outline" size={22} color="#1c7ed6" /> */}
          </TouchableOpacity>
        ),
      });
    }
  }, [task, navigation]);

  if (!task) {
    return (
      <Screen>
        <View style={styles.container}>
          <Text>Task not found</Text>
        </View>
      </Screen>
    );
  }

  const handleToggleComplete = async () => {
    try {
      setIsLoading(true);
      // Dispatch the toggle action
      dispatch(toggleTaskCompletion(taskId));
      // TODO: Update task in the backend
    } catch (error) {
      Alert.alert('Error', 'Failed to update task status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPress = () => {
    // Navigate to edit screen (which we'll implement as AddTask with an edit mode)
    navigation.navigate('AddTask', { taskId: task.id });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              // Dispatch the delete action
              dispatch(deleteTask(taskId));
              // TODO: Delete task from the backend
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <TouchableOpacity 
                style={[styles.checkbox, task.isCompleted && styles.checkboxCompleted]}
                onPress={handleToggleComplete}
                disabled={isLoading}
              >
                {task.isCompleted && <Text>✓</Text>}
              </TouchableOpacity>
              <Text style={[styles.title, task.isCompleted && styles.completedTask]}>
                {task.title}
              </Text>
            </View>
            
            <View style={styles.metaContainer}>
              {task.dueDate && (
                <View style={styles.metaItem}>
                  {/* <Ionicons name="calendar-outline" size={16} color="#666" /> */}
                  <Text style={styles.metaText}>
                    Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </Text>
                </View>
              )}
              
              <View style={styles.metaItem}>
                {/* <Ionicons name="time-outline" size={16} color="#666" /> */}
                <Text style={styles.metaText}>
                  Created: {format(new Date(task.createdAt), 'MMM d, yyyy')}
                </Text>
              </View>
              
              {task.updatedAt !== task.createdAt && (
                <View style={styles.metaItem}>
                  {/* <Ionicons name="refresh-outline" size={16} color="#666" /> */}
                  <Text style={styles.metaText}>
                    Updated: {format(new Date(task.updatedAt), 'MMM d, yyyy')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {task.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{task.description}</Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={handleEditPress}
              disabled={isLoading}
            >
              {/* <Ionicons name="create-outline" size={18} color="#fff" /> */}
              <Text style={styles.actionButtonText}>Edit Task</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
              disabled={isLoading}
            >
              {/* <Ionicons name="trash-outline" size={18} color="#fff" /> */}
              <Text style={styles.actionButtonText}>Delete Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: '#1c7ed6',
    borderColor: '#1c7ed6',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  metaContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: '#1c7ed6',
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#f03e3e',
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  headerButton: {
    marginRight: 16,
  },
});

export default TaskDetailScreen;
