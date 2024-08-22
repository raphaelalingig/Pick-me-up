import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';

const AccountSettingsScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={{ uri: 'https://your-map-image-url.com' }} // Replace with your map image URL or local asset
      style={styles.background}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuButtonText}>☰</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <Image 
          source={{ uri: 'https://your-profile-icon-url.com' }} // Replace with your profile icon URL or local asset
          style={styles.profileIcon}
        />
        <Text style={styles.customerName}>Customer Name</Text>
        <Text style={styles.sectionTitle}>Account Settings</Text>

        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>👤 Personal Information</Text>
        </View>
        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>🔒 Change Password</Text>
        </View>
        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>❓ About PickMeUp App</Text>
        </View>
        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>❓ Help and Support</Text>
        </View>
        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>☑️ App Version 1.1.00.1</Text>
        </View>
        
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
  },
  menuButton: {
    padding: 10,
  },
  menuButtonText: {
    fontSize: 24,
  },
  container: {
    backgroundColor: '#FFD700',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
    marginBottom: 10,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  optionContainer: {
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 10,
  },
  optionText: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
 
});

export default AccountSettingsScreen;
