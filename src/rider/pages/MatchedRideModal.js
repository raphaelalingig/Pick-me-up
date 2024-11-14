// MatchModal.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const MatchModal = ({ visible, onClose, matchDetails, navigation }) => {
  const handleCloseMatchModal = () => {
    setShowMatchModal(false);
    if (matchDetails) {
      navigation.navigate("Home");
    }
  };


  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>It's a Match! 🎉</Text>
          <Text style={styles.modalText}>
            You've found a ride partner! Get ready for your journey.
          </Text>
{/*           
          {matchDetails && (
            <View style={styles.rideDetails}>
              <Text style={styles.modalText}>
                Pickup: {matchDetails.pickup_location}
              </Text>
              <Text style={styles.modalText}>
                Dropoff: {matchDetails.dropoff_location}
              </Text>
              <Text style={styles.modalText}>
                Customer: {matchDetails.customer_name}
              </Text>
              <Text style={styles.modalText}>
                Fare: ₱{matchDetails.fare}
              </Text>
            </View>
          )} */}

          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleCloseMatchModal}
          >
            <Text style={styles.buttonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: "center",
  },
  rideDetails: {
    marginTop: 15,
    width: "100%",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
  },
  actionButton: {
    padding: 12,
    borderRadius: 25,
    width: "100%",
    marginTop: 20,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});

export default MatchModal;