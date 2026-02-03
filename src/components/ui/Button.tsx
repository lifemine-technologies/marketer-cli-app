import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { cn } from "@/lib/utils";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
  className?: string;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  disabled = false,
  variant = "default",
  size = "default",
  className,
  loading = false,
}) => {
  const baseStyles = "flex-row items-center justify-center rounded-xl";
  
  const variantStyles = {
    default: "bg-blue-600 active:bg-blue-700 dark:bg-blue-500 dark:active:bg-blue-600 shadow-lg",
    destructive: "bg-red-500 active:bg-red-600 dark:bg-red-500 dark:active:bg-red-600 shadow-lg",
    outline: "border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-800 active:bg-blue-50 dark:active:bg-blue-900/20",
    secondary: "bg-gray-100 active:bg-gray-200 dark:bg-gray-700 dark:active:bg-gray-600 shadow-sm",
    ghost: "bg-transparent active:bg-gray-100 dark:active:bg-slate-700",
    link: "bg-transparent underline-offset-4",
  };
  
  const sizeStyles = {
    default: "h-12 px-5 py-3",
    sm: "h-10 px-4 text-sm",
    lg: "h-14 px-6 text-lg",
    icon: "h-12 w-12",
    "icon-sm": "h-10 w-10",
    "icon-lg": "h-14 w-14",
  };

  const textColorStyles = {
    default: "text-white dark:text-white",
    destructive: "text-white dark:text-white",
    outline: "text-blue-600 dark:text-blue-400",
    secondary: "text-gray-900 dark:text-slate-100",
    ghost: "text-gray-900 dark:text-slate-100",
    link: "text-blue-600 dark:text-blue-400",
  };

  const textSizeStyles = {
    default: "text-base",
    sm: "text-sm",
    lg: "text-lg",
    icon: "text-base",
    "icon-sm": "text-sm",
    "icon-lg": "text-lg",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && "opacity-50",
        className
      )}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === "default" || variant === "destructive" || variant === "secondary" ? "#ffffff" : "#2563eb"} 
        />
      ) : (
        <Text
          className={cn(
            "font-semibold",
            textColorStyles[variant],
            textSizeStyles[size],
            variant === "link" && "underline"
          )}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};
