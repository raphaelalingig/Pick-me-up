import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';

const Settings = ({ navigation }) => {
  return (
    <ImageBackground
      source={{ uri: 'https://your-map-image-url.com' }} // Replace with your map image URL or local asset
      style={styles.background}
    >
      
      <View style={styles.container}>
        <Image 
          source={{ uri: 'https://your-profile-icon-url.com' }} // Replace with your profile icon URL or local asset
          style={styles.profileIcon}
        />
        
        <Text style={styles.customerName}>Customer Name</Text>
        <Text style={styles.sectionTitle}>Account Settings</Text>

        <TouchableOpacity style={styles.optionContainer}>
          <Text style={styles.optionText}> Personal Information</Text>
        </TouchableOpacity>
        <View style={styles.optionContainer}>
          <Text style={styles.optionText}> Change Password</Text>
        </View>
        <View style={styles.optionContainer}>
          <Text style={styles.optionText}> About PickMeUp App</Text>
        </View>
        <View style={styles.optionContainer}>
          <Text style={styles.optionText}> Help and Support</Text>
        </View>
        <View style={styles.optionContainer}>
          <Text style={styles.optionText}> App Version 1.1.00.1</Text>
        </View>
        
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    backgroundColor: 'white',
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
    backgroundColor: 'rgba(250, 205, 0, 0.8)',
    margin: 20,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 5, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
    marginBottom: 10,
  },
  customerName: {
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  optionContainer: {
    width: '100%',
    paddingVertical: 15,
    marginBottom: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
 
});

export default Settings;
