import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, AppTheme } from './theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setTheme } from '../redux/slices/settingsSlice';

type ThemeContextType = {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const systemColorScheme = useColorScheme();
  const { theme: storedTheme } = useSelector((state: RootState) => state.settings);
  const [isDark, setIsDark] = useState(storedTheme === 'dark' || (storedTheme === 'system' && systemColorScheme === 'dark'));

  // Update theme when system theme or stored theme changes
  useEffect(() => {
    if (storedTheme === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(storedTheme === 'dark');
    }
  }, [systemColorScheme, storedTheme]);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    dispatch(setTheme(newTheme));
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const withTheme = <P extends object>(Component: React.ComponentType<P>) => {
  return function WithTheme(props: P) {
    const { theme } = useTheme();
    return <Component {...props} theme={theme} />;
  };
};
