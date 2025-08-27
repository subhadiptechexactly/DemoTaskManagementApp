import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  syncOnCellular: boolean;
  isFirstLaunch: boolean;
  lastSync: number | null;
}

const initialState: SettingsState = {
  theme: 'light',
  notificationsEnabled: true,
  syncOnCellular: false,
  isFirstLaunch: true,
  lastSync: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.notificationsEnabled = action.payload;
    },
    setSyncOnCellular: (state, action: PayloadAction<boolean>) => {
      state.syncOnCellular = action.payload;
    },
    setFirstLaunch: (state, action: PayloadAction<boolean>) => {
      state.isFirstLaunch = action.payload;
    },
    setLastSync: (state, action: PayloadAction<number>) => {
      state.lastSync = action.payload;
    },
    resetSettings: () => initialState,
  },
});

export const {
  setTheme,
  toggleTheme,
  setNotificationsEnabled,
  setSyncOnCellular,
  setFirstLaunch,
  setLastSync,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
