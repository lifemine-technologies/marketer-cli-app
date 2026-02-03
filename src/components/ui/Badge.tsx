import React from "react";
import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "default",
}) => {
  const variantStyles = {
    default: "bg-blue-600 text-white",
    secondary: "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100",
    destructive: "bg-red-500 text-white",
    outline: "border border-gray-300 bg-transparent text-gray-900 dark:border-gray-600 dark:text-gray-100",
  };

  return (
    <View
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      <Text
        className={cn(
          "text-xs font-semibold",
          variant === "default" || variant === "destructive"
            ? "text-white"
            : variant === "secondary"
            ? "text-gray-900 dark:text-gray-100"
            : "text-gray-900 dark:text-gray-100"
        )}
      >
        {children}
      </Text>
    </View>
  );
};
