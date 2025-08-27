import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Screen from '../../components/Screen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { useDispatch, useSelector } from 'react-redux';
import { addTask, updateTask, Task } from '../../redux/slices/taskSlice';
import { getCurrentUserId } from '../../firebase/config';
import { repoAddTask, repoUpdateTask } from '../../storage/offlineRepo';

import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = NativeStackScreenProps<AppStackParamList, 'AddTask'>;

const AddTaskScreen = ({ route, navigation }: Props) => {
  const { taskId } = route.params || {};
  const isEditMode = !!taskId;
  
  // Get the task if in edit mode
  const existingTask = useSelector((state: any) => 
    taskId ? state.tasks.tasks.find((t: Task) => t.id === taskId) : null
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    // Set up header
    navigation.setOptions({
      title: isEditMode ? 'Edit Task' : 'Add New Task',
    });

    // If in edit mode, pre-fill the form
    if (isEditMode && existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description || '');
      if (existingTask.dueDate) {
        setDueDate(new Date(existingTask.dueDate));
      }
    }
  }, [isEditMode, existingTask, navigation]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the task');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (isEditMode) {
        // Optimistic update in Redux
        const optimistic: Task = {
          id: existingTask.id,
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: dueDate ? dueDate.toISOString() : undefined,
          isCompleted: existingTask.isCompleted,
          createdAt: existingTask.createdAt,
          updatedAt: new Date().toISOString(),
          userId: existingTask.userId,
        };
        dispatch(updateTask(optimistic));
        // Fire-and-forget persistence (works offline via queue)
        repoUpdateTask(existingTask.id, {
          title: optimistic.title,
          description: optimistic.description,
          dueDate: dueDate ?? null,
        }).catch(() => {});
        // Navigate back immediately
        navigation.goBack();
        return;
      } else {
        const uid = getCurrentUserId() || 'local';
        const optimistic: Task = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: dueDate ? dueDate.toISOString() : undefined,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: uid,
        };
        // Optimistic Redux add
        dispatch(addTask(optimistic));
        // Persist via offline repo (will queue if offline) - fire-and-forget
        repoAddTask({
          id: optimistic.id,
          title: optimistic.title,
          description: optimistic.description,
          dueDate: dueDate ?? null,
          isCompleted: false,
          userId: uid,
        }).catch(() => {});
        // Navigate back immediately
        navigation.goBack();
        return;
      }
      
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title *</Text>
            <View style={styles.inputRow}>
              <Ionicons name="document-text-outline" size={18} color="#64748b" />
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="Enter task title"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
                autoFocus
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputRow, styles.textAreaRow]}>
              <Ionicons name="create-outline" size={18} color="#64748b" style={{ marginTop: 6 }} />
              <TextInput
                style={[styles.input, styles.textArea, styles.inputFlex]}
                placeholder="Enter task description (optional)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Due Date (Optional)</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={18} color="#64748b" />
                <Text style={[styles.dateText, !dueDate && styles.placeholderText]}>
                  {dueDate ? dueDate.toLocaleDateString() : 'Select a due date'}
                </Text>
              </View>
              {!!dueDate && (
                <View style={styles.dateBadge}>
                  <Text style={styles.dateBadgeText}>Set</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
            
            {dueDate && (
              <TouchableOpacity 
                style={styles.clearDateButton}
                onPress={() => setDueDate(null)}
              >
                <Text style={styles.clearDateText}>Clear date</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </Screen>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={18} color="#495057" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.submitButton, 
            (!title.trim() || isSubmitting) && styles.buttonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!title.trim() || isSubmitting}
          activeOpacity={0.9}
        >
          <Ionicons name={isEditMode ? 'save-outline' : 'add'} size={18} color="#fff" />
          <Text style={styles.submitButtonText}>
            {isSubmitting 
              ? (isEditMode ? 'Updating...' : 'Adding...')
              : (isEditMode ? 'Update Task' : 'Add Task')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Space for the footer
  },
  formGroup: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  inputFlex: {
    flex: 1,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  textAreaRow: {
    alignItems: 'flex-start',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  dateBadge: {
    backgroundColor: '#e7f5ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateBadgeText: {
    color: '#1c7ed6',
    fontSize: 12,
    fontWeight: '600',
  },
  clearDateButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  clearDateText: {
    color: '#1c7ed6',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f1f3f5',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#1c7ed6',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddTaskScreen;
