import React, { ReactNode } from 'react';
import { StatusBar, StatusBarStyle, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = {
  children: ReactNode;
  barStyle?: StatusBarStyle;
  backgroundColor?: string;
  statusBarColor?: string;
  barTranslucent?: boolean;
};

const Screen = ({
  children,
  barStyle = 'dark-content',
  backgroundColor = '#fff',
  statusBarColor = '#fff',
  barTranslucent = false,
}: ScreenProps) => {
  return (
    <>
      <StatusBar
        barStyle={barStyle}
        backgroundColor={statusBarColor}
        translucent={barTranslucent}
      />
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right', 'bottom']}>
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
