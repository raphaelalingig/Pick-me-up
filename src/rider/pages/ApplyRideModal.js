import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-root-toast';

const ApplyRideModal = ({ visible, ride, userService, onClose, navigation }) => {
  if (!ride) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDecline = async () => {
    try {
      const apply_id = ride.apply_id;
      const response = await userService.decline_ride(apply_id);

      const toastMessage = response.data.message === "Declined" 
        ? 'Declined Ride Successfully' 
        : 'Ride no longer available';

      Toast.show(toastMessage, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        backgroundColor: '#333',
        textColor: '#fff',
      });

      onClose(); // Close the modal
    } catch (error) {
      console.error("Failed to decline ride:", error);
      Alert.alert("Error", "Failed to decline ride. Please try again.");
    }
  };

  const handleCancelConfirmation = useCallback(() => {
    Alert.alert(
      "Decline Ride",
      "Are you sure you want to decline this ride?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: handleDecline,
          style: "destructive",
        },
      ]
    );
  }, [handleDecline]);

  const handleViewButton = () => {
    navigation.navigate("BookingDetails", { ride });
    onClose(); // Close the modal
  };

  const fareComparison = parseFloat(ride.calculated_fare) > parseFloat(ride.fare) ? 'text-red-500' : 'text-green-500';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Ride Request!</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>New</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.infoRow}>
              <Icon name="user" size={20} color="#4B5563" />
              <Text style={styles.label}>Passenger</Text>
              <Text style={styles.value}>{ride.applier_name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="clock" size={20} color="#4B5563" />
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{formatDate(ride.ride_date)}</Text>
            </View>

            <View style={styles.fareContainer}>
              <View style={styles.fareRow}>
                <Icon name="dollar-sign" size={20} color="#4B5563" />
                <Text style={styles.label}>Calculated Fare</Text>
                <Text style={styles.fareValue}>₱{parseFloat(ride.calculated_fare).toFixed(2)}</Text>
              </View>
              
              <View style={styles.fareRow}>
                <Icon name="dollar-sign" size={20} color="#4B5563" />
                <Text style={styles.label}>Offered Fare</Text>
                <Text style={[styles.fareValue, { color: fareComparison === 'text-red-500' ? '#EF4444' : '#10B981' }]}>
                  ₱{parseFloat(ride.fare).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.button, styles.viewButton]} 
              onPress={handleViewButton}
            >
              <Text style={styles.buttonText}>View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.declineButton]} 
              onPress={handleCancelConfirmation}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  badge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  label: {
    fontSize: 16,
    color: '#4B5563',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  fareContainer: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fareValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#3B82F6',
  },
  declineButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  declineButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ApplyRideModal;
