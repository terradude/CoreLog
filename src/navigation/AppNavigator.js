import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../theme/colors';

import ProjectTypeScreen from '../screens/ProjectTypeScreen';
import ProjectListScreen from '../screens/ProjectListScreen';
import LogHeaderScreen from '../screens/LogHeaderScreen';
import BoxTallyScreen from '../screens/BoxTallyScreen';
import BoxDepthsScreen from '../screens/BoxDepthsScreen';
import MainLoggingScreen from '../screens/MainLoggingScreen';
import StripLogScreen from '../screens/StripLogScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.navy },
  headerTintColor: colors.textOnDark,
  headerTitleStyle: { fontWeight: '700', fontSize: 18 },
  cardStyle: { backgroundColor: colors.bg },
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions} initialRouteName="ProjectList">
        <Stack.Screen
          name="ProjectList"
          component={ProjectListScreen}
          options={{ title: 'CoreLog — Projects' }}
        />
        <Stack.Screen
          name="ProjectType"
          component={ProjectTypeScreen}
          options={{ title: 'New Project' }}
        />
        <Stack.Screen
          name="LogHeader"
          component={LogHeaderScreen}
          options={{ title: 'Log Header' }}
        />
        <Stack.Screen
          name="BoxTally"
          component={BoxTallyScreen}
          options={{ title: 'Box / Section Tally' }}
        />
        <Stack.Screen
          name="BoxDepths"
          component={BoxDepthsScreen}
          options={{ title: 'Box / Section Depths' }}
        />
        <Stack.Screen
          name="MainLogging"
          component={MainLoggingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="StripLog"
          component={StripLogScreen}
          options={{ title: 'Strip Log' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
