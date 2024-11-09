import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ImageBackground } from 'react-native';

const VerifyPhoneNumberScreen = () => {
  return (
    <ImageBackground
      source={{ uri: 'https://your-map-image-url.com' }} // Replace with your map image URL or local asset
      style={styles.background}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Verify Phone Number</Text>
        <Text style={styles.subTitle}>We send you a confirmation into your phone number</Text>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} keyboardType="number-pad" maxLength={1} />
          <TextInput style={styles.input} keyboardType="number-pad" maxLength={1} />
          <TextInput style={styles.input} keyboardType="number-pad" maxLength={1} />
          <TextInput style={styles.input} keyboardType="number-pad" maxLength={1} />
          <TextInput style={styles.input} keyboardType="number-pad" maxLength={1} />
          <TextInput style={styles.input} keyboardType="number-pad" maxLength={1} />
        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
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
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
  },
  container: {
    backgroundColor: '#333',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    width: 40,
    textAlign: 'center',
    fontSize: 18,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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
  confirmButton: {
    backgroundColor: '#00FF00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VerifyPhoneNumberScreen;



