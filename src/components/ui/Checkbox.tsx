import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const styles = StyleSheet.create({
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxUnchecked: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
}) => {
  const handlePress = React.useCallback(() => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  }, [disabled, onCheckedChange, checked]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.checkbox,
        checked ? styles.checkboxChecked : styles.checkboxUnchecked,
        disabled && styles.checkboxDisabled,
      ]}
    >
      {checked && <Text style={styles.checkmark}>✓</Text>}
    </Pressable>
  );
};
