import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS } from './constants/theme';

export const CustomButton = ({ 
  onPress, 
  title, 
  variant = 'primary',
  disabled = false,
  loading = false 
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      styles[variant],
      disabled && styles.disabled
    ]}
    onPress={onPress}
    disabled={disabled || loading}
  >
    <Text style={[styles.buttonText, styles[`${variant}Text`]]}>
      {loading ? 'Loading...' : title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  danger: {
    backgroundColor: COLORS.error,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryText: {
    color: COLORS.secondary,
  },
  secondaryText: {
    color: COLORS.white,
  },
  dangerText: {
    color: COLORS.white,
  },
});