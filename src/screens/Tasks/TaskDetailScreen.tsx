import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Screen from '../../components/Screen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { useDispatch, useSelector } from 'react-redux';
import { Task, toggleTaskCompletion, deleteTask } from '../../redux/slices/taskSlice';
import { repoUpdateTask, repoDeleteTask } from '../../storage/offlineRepo';

import { format } from 'date-fns';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = NativeStackScreenProps<AppStackParamList, 'TaskDetail'>;

const TaskDetailScreen = ({ route, navigation }: Props) => {
  const { taskId } = route.params;
  const dispatch = useDispatch();
  
  // Get the task from the Redux store
  const task: Task | undefined = useSelector((state: any) => 
    state.tasks.tasks.find((t: Task) => t.id === taskId)
  );

  const [isLoading, setIsLoading] = useState(false);

  // Stable edit handler used in header
  const handleEditPress = useCallback(() => {
    if (!task) return;
    navigation.navigate('AddTask', { taskId: task.id });
  }, [navigation, task]);

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
            <Ionicons name="create-outline" size={22} color="#1c7ed6" />
          </TouchableOpacity>
        ),
      });
    }
  }, [task, navigation, handleEditPress]);

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
      // Optimistic Redux toggle
      dispatch(toggleTaskCompletion(taskId));
      // Persist via offline repo (queues if offline)
      await repoUpdateTask(taskId, { isCompleted: !task?.isCompleted });
    } catch (error) {
      Alert.alert('Error', 'Failed to update task status');
    } finally {
      setIsLoading(false);
    }
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
              // Optimistic Redux delete
              dispatch(deleteTask(taskId));
              // Persist via offline repo (queues if offline)
              await repoDeleteTask(taskId);
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
                activeOpacity={0.7}
              >
                {task.isCompleted ? (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                ) : (
                  <Ionicons name="ellipse-outline" size={18} color="#bbb" />
                )}
              </TouchableOpacity>
              <Text style={[styles.title, task.isCompleted && styles.completedTask]}>
                {task.title}
              </Text>
            </View>

            <View style={styles.chipsRow}>
              <View style={[styles.chip, task.isCompleted ? styles.chipCompleted : styles.chipActive]}>
                <Ionicons name={task.isCompleted ? 'checkmark-circle' : 'time-outline'} size={14} color={task.isCompleted ? '#2b8a3e' : '#1c7ed6'} />
                <Text style={[styles.chipText, task.isCompleted ? styles.chipTextCompleted : styles.chipTextActive]}>
                  {task.isCompleted ? 'Completed' : 'Active'}
                </Text>
              </View>
              {task.dueDate && (
                <View style={[styles.chip, styles.chipDate]}>
                  <Ionicons name="calendar-outline" size={14} color="#1c7ed6" />
                  <Text style={[styles.chipText, styles.chipTextActive]}>
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
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
              activeOpacity={0.85}
            >
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Edit Task</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={18} color="#fff" />
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
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#eef2f7',
  },
  chipActive: {
    backgroundColor: '#e7f5ff',
  },
  chipCompleted: {
    backgroundColor: '#e6fcf5',
  },
  chipDate: {
    backgroundColor: '#e7f5ff',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#1c7ed6',
  },
  chipTextCompleted: {
    color: '#2b8a3e',
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
