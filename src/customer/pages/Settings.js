import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import userService from '../../services/auth&services';

const Settings = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [account, setAccount] = useState(null);

  const fectchAcc = async () => {
    try{
      const response = await userService.fetchCustomer();
      setAccount(response);
      console.log(response)
    }catch (error) {
      Alert.alert("Error", "Unable to process your request. Please try again.");
    };
  }

  useFocusEffect(
    useCallback(() => {
      fectchAcc();
      // setShowMatchModal(false);
    }, [])
  );
  

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
            {account ? (
              <>
                <Text>Name: {account.first_name} {account.last_name}</Text>
                <Text>Mail: {account.email}</Text>
                <Text>PhoneNumber: {account.mobile_number}</Text>
              </>
            ) : (
              <Text>Loading account information...</Text>
            )}
          </View>
        );
      case 'Change Password':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput placeholder="New Password" style={styles.input} secureTextEntry />
            <TextInput placeholder="Confirm Password" style={styles.input} secureTextEntry />
            <TouchableOpacity style={styles.saveButton} onPress={closeModal}>
              <Text style={styles.buttonText}>Change</Text>
            </TouchableOpacity>
          </View>
        );
      case 'About PickMeUp':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>About PickMeUp</Text>
            <Text style={styles.modalText}>This app connects riders with customers for quick transportation services.</Text>
          </View>
        );
      case 'Help and Support':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Help and Support</Text>
            <Text style={styles.modalText}>If you need assistance, please contact support@pickmeup.com</Text>
          </View>
        );
      case 'App Version':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>App Version</Text>
            <Text style={styles.modalText}>Version 1.1.00.1</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ImageBackground
    source={require("../../pictures/3.png")} // Replace with your map image URL or local asset
    style={styles.background}
    >
      <View style={styles.container}>
        <Image 
          source={require("../../pictures/user_icon.png")}
          style={styles.profileIcon}
        />
        
        <Text style={styles.customerName}>{account ? `${account.first_name} ${account.last_name}` : "Loading..."}</Text>
        <Text style={styles.sectionTitle}>Account Settings</Text>

        {['Personal Information', 'About PickMeUp', 'Help and Support', 'App Version'].map((option) => (
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
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>✖</Text>
            </TouchableOpacity>
            {renderModalContent()}
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
    justifyContent: 'space-evenly',
  },
  container: {
    backgroundColor: '#FBC635',
    margin: 20,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
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
    color: '#333', // Darker text for better readability
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FBC635', // Match title color with theme
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555', // Darker gray for better readability
  },
  input: {
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#008000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FF0000', // Red color for visibility
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Settings;