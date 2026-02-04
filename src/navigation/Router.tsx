import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthUserContext } from '../utils/contexts/authUserContext';
import { RootStackParamList } from './types';
import { LoginPage } from '../pages/auth/login/LoginPage';
import { ProtectedRoute } from './ProtectedRoute';
import { View, Text, ActivityIndicator } from 'react-native';
import { navigationRef } from './rootNavigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const Router = () => {
  const authContext = useContext(AuthUserContext);

  if (!authContext) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-slate-900">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-lg text-gray-900 dark:text-slate-100">
          Initializing...
        </Text>
      </View>
    );
  }

  const { user, userLoading } = authContext;

  if (userLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-slate-900">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-lg text-gray-900 dark:text-slate-100">
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user?.accessToken ? (
          <Stack.Screen name="Protected" component={ProtectedRoute} />
        ) : (
          <Stack.Screen name="Login" component={LoginPage} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
