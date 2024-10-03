import React from 'react';
import { TextInput } from 'react-native-paper';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const CustomIconInput = ({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry, 
  iconName, 
  onIconPress,
  theme,
  ...props 
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        mode="outlined"
        theme={theme}
        {...props}
      />
      {iconName && (
        <TouchableOpacity style={styles.iconContainer} onPress={onIconPress}>
          <Feather name={iconName} size={24} color={theme?.colors?.primary || "#000"} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
    height: '100%',
    justifyContent: 'center',
  },
});

export default CustomIconInput;