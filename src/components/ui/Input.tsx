import React from "react";
import { TextInput, View, Text } from "react-native";
import { cn } from "@/lib/utils";

interface InputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  type?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
  multiline?: boolean;
  numberOfLines?: number;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  disabled = false,
  className,
  error,
  type,
  keyboardType,
  multiline = false,
  numberOfLines,
}) => {
  const getKeyboardType = () => {
    if (keyboardType) return keyboardType;
    if (type === "tel") return "phone-pad";
    if (type === "email") return "email-address";
    if (type === "number" || type === "numeric") return "numeric";
    return "default";
  };

  return (
    <View className="w-full">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry || type === "password"}
        editable={!disabled}
        keyboardType={getKeyboardType()}
        multiline={multiline}
        numberOfLines={numberOfLines}
        className={cn(
          multiline 
            ? "min-h-[100px] py-3" 
            : "h-12 py-3",
          "w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 text-base",
          "text-gray-900 dark:text-slate-100",
          "placeholder:text-gray-400 dark:placeholder:text-slate-500",
          disabled && "opacity-50 bg-gray-100 dark:bg-slate-700",
          error && "border-red-400 dark:border-red-400 bg-red-50 dark:bg-red-900/20",
          className
        )}
        placeholderTextColor="#9ca3af"
        textAlignVertical={multiline ? "top" : "center"}
      />
      {error && (
        <Text className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">{error}</Text>
      )}
    </View>
  );
};
