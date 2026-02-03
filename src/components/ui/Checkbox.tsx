import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
}) => {
  return (
    <TouchableOpacity
      onPress={() => !disabled && onCheckedChange?.(!checked)}
      disabled={disabled}
      className={cn(
        "h-5 w-5 rounded border-2 items-center justify-center",
        checked ? "bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 shadow-sm" : "bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600",
        disabled && "opacity-50",
        className
      )}
      activeOpacity={0.7}
    >
      {checked && (
        <Text className="text-white text-sm font-bold">✓</Text>
      )}
    </TouchableOpacity>
  );
};
