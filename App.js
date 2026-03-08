import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ProjectProvider } from './src/context/ProjectContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ProjectProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </ProjectProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
