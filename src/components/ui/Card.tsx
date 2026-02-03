import React from "react";
import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <View
      className={cn(
        "bg-white dark:bg-slate-800 flex flex-col rounded-2xl border border-gray-100 dark:border-slate-700 p-6 shadow-lg",
        className
      )}
    >
      {children}
    </View>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className }) => {
  return (
    <View className={cn("flex flex-col gap-1.5 mb-5", className)}>
      {children}
    </View>
  );
};

export const CardTitle: React.FC<CardProps> = ({ children, className }) => {
  return (
    <Text className={cn("text-xl font-bold text-gray-900 dark:text-slate-100", className)}>
      {children}
    </Text>
  );
};

export const CardDescription: React.FC<CardProps> = ({ children, className }) => {
  return (
    <Text className={cn("text-gray-600 dark:text-slate-400 text-sm", className)}>
      {children}
    </Text>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className }) => {
  return (
    <View className={cn("", className)}>
      {children}
    </View>
  );
};

export const CardFooter: React.FC<CardProps> = ({ children, className }) => {
  return (
    <View className={cn("flex flex-row items-center mt-5 pt-5 border-t border-gray-100 dark:border-slate-700", className)}>
      {children}
    </View>
  );
};
