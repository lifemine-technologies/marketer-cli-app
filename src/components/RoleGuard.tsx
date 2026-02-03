import React, { useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { UserProviderContext, type UserRole } from "../utils/contexts/authUserContext";
import Ionicons from "react-native-vector-icons/Ionicons";

interface RoleGuardProps {
  allowedRoles: UserRole[] | false;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children, fallback }) => {
  const user = useContext(UserProviderContext);
  const navigation = useNavigation();

  if (!user) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-slate-900 items-center justify-center p-6">
        <Ionicons name="lock-closed-outline" size={48} color="#ef4444" />
        <Text className="text-red-600 dark:text-red-400 text-center mt-4 text-base font-semibold">
          Access Denied
        </Text>
        <Text className="text-gray-600 dark:text-slate-400 text-center mt-2 text-sm">
          Please login to continue
        </Text>
        <TouchableOpacity
          onPress={() => {
            // @ts-ignore
            navigation.navigate("Login");
          }}
          className="mt-4 bg-blue-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If allowedRoles is false, deny access
  if (allowedRoles === false) {
    return (
      fallback || (
        <View className="flex-1 bg-gray-50 dark:bg-slate-900 items-center justify-center p-6">
          <Ionicons name="lock-closed-outline" size={48} color="#ef4444" />
          <Text className="text-red-600 dark:text-red-400 text-center mt-4 text-base font-semibold">
            Access Denied
          </Text>
          <Text className="text-gray-600 dark:text-slate-400 text-center mt-2 text-sm">
            You don't have permission to access this page
          </Text>
        </View>
      )
    );
  }

  // If allowedRoles is an array, check if user role is included
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return (
        fallback || (
          <View className="flex-1 bg-gray-50 dark:bg-slate-900 items-center justify-center p-6">
            <Ionicons name="lock-closed-outline" size={48} color="#ef4444" />
            <Text className="text-red-600 dark:text-red-400 text-center mt-4 text-base font-semibold">
              Access Denied
            </Text>
            <Text className="text-gray-600 dark:text-slate-400 text-center mt-2 text-sm">
              This page is only accessible to: {allowedRoles.join(", ")}
            </Text>
            <Text className="text-gray-500 dark:text-slate-500 text-center mt-1 text-xs">
              Your role: {user.role}
            </Text>
          </View>
        )
      );
    }
  }

  return <>{children}</>;
};
