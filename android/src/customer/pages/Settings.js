import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Modal,
  TextInput,
  Button,
} from 'react-native';

const Settings = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const openModal = (option) => {
    setSelectedOption(option);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedOption(null);
    setModalVisible(false);
  };

  const renderModalContent = () => {
    switch (selectedOption) {
      case 'Personal Information':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Personal Information</Text>
            {/* Add your personal info fields here */}
            <TextInput placeholder="Name" style={styles.input} />
            <TextInput placeholder="Email" style={styles.input} />
            <Button title="Save" onPress={closeModal} />
          </View>
        );
      case 'Change Password':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput placeholder="New Password" style={styles.input} secureTextEntry />
            <TextInput placeholder="Confirm Password" style={styles.input} secureTextEntry />
            <Button title="Change" onPress={closeModal} />
          </View>
        );
      case 'About PickMeUp':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>About PickMeUp</Text>
            <Text>This app connects riders with customers for quick transportation services.</Text>
            <Button title="Close" onPress={closeModal} />
          </View>
        );
      case 'Help and Support':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Help and Support</Text>
            <Text>If you need assistance, please contact support@pickmeup.com</Text>
            <Button title="Close" onPress={closeModal} />
          </View>
        );
      case 'App Version':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>App Version</Text>
            <Text>Version 1.1.00.1</Text>
            <Button title="Close" onPress={closeModal} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://your-map-image-url.com' }}
      style={styles.background}
    >
      <View style={styles.container}>
        <Image 
          source={{ uri: 'https://your-profile-icon-url.com' }}
          style={styles.profileIcon}
        />
        
        <Text style={styles.customerName}>Customer Name</Text>
        <Text style={styles.sectionTitle}>Account Settings</Text>

        {['Personal Information', 'Change Password', 'About PickMeUp', 'Help and Support', 'App Version'].map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.optionContainer}
            onPress={() => openModal(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            {renderModalContent()}
            <Button title="Close" onPress={closeModal} />
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    backgroundColor: 'white',
  },
  container: {
    backgroundColor: 'rgba(250, 205, 0, 0.8)',
    margin: 20,
    borderRadius: 20,
    padding: 30,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
});

export default Settings;
