import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ImageBackground } from 'react-native';

const SubmitReportScreen = () => {
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
        <Text style={styles.title}>Submit your report</Text>
        <TextInput
          style={styles.input}
          placeholder="Rider Name"
          // Add onChangeText functionality
        />
        <TextInput
          style={styles.textArea}
          placeholder="Write Down your Complaint"
          multiline
          numberOfLines={4}
          // Add onChangeText functionality
        />
        <TextInput
          style={styles.input}
          placeholder="Date"
          // Add onChangeText functionality
        />
        <TextInput
          style={styles.input}
          placeholder="Date of location"
          // Add onChangeText functionality
        />
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
  },
  textArea: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    height: 100,
    textAlignVertical: 'top',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sendButton: {
    backgroundColor: '#00FF00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SubmitReportScreen;


