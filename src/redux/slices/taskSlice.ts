import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: TaskState = {
  tasks: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    fetchTasksStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchTasksSuccess: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.isLoading = false;
      state.error = null;
      state.lastUpdated = Date.now();
    },
    fetchTasksFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
      state.lastUpdated = Date.now();
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
        state.lastUpdated = Date.now();
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
      state.lastUpdated = Date.now();
    },
    toggleTaskCompletion: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find(task => task.id === action.payload);
      if (task) {
        task.isCompleted = !task.isCompleted;
        task.updatedAt = new Date().toISOString();
        state.lastUpdated = Date.now();
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  clearError,
} = taskSlice.actions;

export default taskSlice.reducer;
