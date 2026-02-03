import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList, TabParamList } from './types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserProviderContext } from '../utils/contexts/authUserContext';
import { DashboardPage } from '../pages/user/dashboard/DashboardPage';
import { MyVendorsListPage } from '../pages/user/vendor/MyVendorsListPage';
import { AllMarketersPage } from '../pages/user/marketers/AllMarketersPage';
import { ViewVendorPage } from '../pages/user/vendor/ViewVendorPage';
import { NewVendorPage } from '../pages/user/vendor/newVendor/NewVendorPage';
import { AddMarketerPage } from '../pages/user/marketers/AddMarketerPage';
import { ViewMarketerPage } from '../pages/user/marketers/viewMarketer/ViewMarketerPage';
import { View, Text } from 'react-native';

const Stack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Placeholder components - will be replaced when pages are created

// Bottom Tab Navigator - Dynamic based on user role
const MainTabs = () => {
  const user = useContext(UserProviderContext);
  const userRole = user?.role || 'COORDINATOR';
  const isAdmin = userRole === 'ADMIN';
  const isManager = userRole === 'MANAGER';
  const canViewCoordinators = isAdmin || isManager;
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          height: 70 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: 10,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={DashboardPage}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size || 24} color={color} />
          ),
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Vendors"
        component={MyVendorsListPage}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'storefront' : 'storefront-outline'}
              size={size || 24}
              color={color}
            />
          ),
          tabBarLabel: 'Vendors',
        }}
      />
      {canViewCoordinators && (
        <Tab.Screen
          name="Coordinators"
          component={AllMarketersPage}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'people' : 'people-outline'}
                size={size || 24}
                color={color}
              />
            ),
            tabBarLabel: 'Coordinators',
          }}
        />
      )}
    </Tab.Navigator>
  );
};

export const ProtectedRoute = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#111827',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
      }}>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ViewVendor" component={ViewVendorPage} />
      <Stack.Screen name="NewVendor" component={NewVendorPage} />
      <Stack.Screen name="AddMarketer" component={AddMarketerPage} />
      <Stack.Screen name="ViewMarketer" component={ViewMarketerPage} />
    </Stack.Navigator>
  );
};

export const useUserPermissions = () => {
  const user = useContext(UserProviderContext);

  const hierarchyRoles: Record<string, number> = {
    ADMIN: 3,
    MANAGER: 2,
    TELECALLER: 1,
    COORDINATOR: 0,
  };

  const userRole = user?.role || 'COORDINATOR';

  return {
    isAdmin: userRole === 'ADMIN',
    isManager: userRole === 'MANAGER',
    isCoordinator: userRole === 'COORDINATOR',
    isTelecaller: userRole === 'TELECALLER',
    userRole,
    can: (requiredRole: string) => hierarchyRoles[userRole] >= hierarchyRoles[requiredRole],
  };
};
