import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const MatchModal = ({ isVisible, matchData, onClose }) => {
  const navigation = useNavigation();

  if (!matchData) return null;

  const handleViewDetails = () => {
    onClose();
    navigation.navigate('RideDetailsScreen', {
      rideId: matchData.rideDetails.ride_id,
      applyId: matchData.rideDetails.apply_id
    });
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.matchHeader}>
            <Text style={styles.matchTitle}>🎉 It's a Match! 🎉</Text>
          </View>

          <View style={styles.rideDetails}>
            <Text style={styles.matchedWith}>
              You've been matched with {matchData.otherUser.name}
            </Text>

            <View style={styles.locationContainer}>
              <Text style={styles.location}>
                📍 From: {matchData.rideDetails.pickup}
              </Text>
              <Text style={styles.location}>
                🎯 To: {matchData.rideDetails.dropoff}
              </Text>
            </View>

            <Text style={styles.dateTime}>
              🕒 {new Date(matchData.rideDetails.date).toLocaleString()}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.viewDetailsButton]}
              onPress={handleViewDetails}
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  matchHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  matchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  matchedWith: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  rideDetails: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 20,
  },
  locationContainer: {
    marginVertical: 10,
  },
  location: {
    fontSize: 16,
    marginVertical: 5,
  },
  dateTime: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'column',
    width: '100%',
    gap: 10,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewDetailsButton: {
    backgroundColor: '#2196F3',
  },
  viewDetailsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#666',
    fontSize: 16,
  },
});