import React, { ReactNode } from 'react';
import { StatusBar, StatusBarStyle, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

type ScreenProps = {
  children: ReactNode;
  barStyle?: StatusBarStyle;
  backgroundColor?: string;
  statusBarColor?: string;
  barTranslucent?: boolean;
};

const Screen = ({
  children,
  barStyle,
  backgroundColor,
  statusBarColor,
  barTranslucent = false,
}: ScreenProps) => {
  const { theme, isDark } = useTheme();
  const resolvedBarStyle: StatusBarStyle = barStyle ?? (isDark ? 'light-content' : 'dark-content');
  const resolvedBg = backgroundColor ?? theme.colors.background;
  const resolvedStatusBar = statusBarColor ?? theme.colors.background;

  return (
    <>
      <StatusBar
        barStyle={resolvedBarStyle}
        backgroundColor={resolvedStatusBar}
        translucent={barTranslucent}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: resolvedBg }]} edges={['top', 'left', 'right', 'bottom']}>
        {children}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Screen;
