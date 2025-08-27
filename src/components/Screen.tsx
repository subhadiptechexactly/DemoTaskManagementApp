import React, { ReactNode } from 'react';
import { StatusBar, StatusBarStyle, View, StyleSheet, SafeAreaView } from 'react-native';

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
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
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
