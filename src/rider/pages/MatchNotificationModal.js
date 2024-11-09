import React from 'react';
import { View, Text, Modal, Button, StyleSheet, Alert } from 'react-native';

const MatchNotificationModal = ({ visible, customer, onClose }) => {
  // Function to handle accept action


  const getCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission to access location was denied");
      }
  
      try {
        let location = await Location.getCurrentPositionAsync({});
        const newRideLocation = `${location.coords.latitude}, ${location.coords.longitude}`;
        setRiderLocation(newRideLocation);
  
        const [riderLat, riderLng] = newRideLocation.split(",");
  
        const riderLocationDetails = {
          ride_id: ride.ride_id,
          rider_latitude: parseFloat(riderLat),
          rider_longitude: parseFloat(riderLng),
        };
  
        const response = await userService.saveRiderLocation(
          riderLocationDetails
        );
        console.log("Rider location saved successfully:", response.data);
        return response.data;
      } catch (error) {
        console.error("Failed to get or save rider location:", error);
        throw error; // Re-throw the error to be caught in handleAccept
      }
    };

  const accept = async (ride) => {
      if (!userId) {
        Alert.alert("Error", "User ID is not available.");
        return;
      }
  
      await getCurrentLocation;
  
      console.log("Attempting to accept ride with ID:", ride.ride_id);
      setIsLoading(true);
      try {
        const response = await userService.apply_ride(ride.ride_id);
        console.log("Accept ride response:", response.data);
        if (response.data && response.data.message) {
          Alert.alert("Success", response.data.message);
          navigation.navigate("Home");
        } else {
          Alert.alert("Error", "Failed to accept the ride. Please try again.");
        }
      } catch (error) {
        console.error(
          "Failed to Accept Ride",
          error.response ? error.response.data : error.message
        );
        if (error.response && error.response.status === 404) {
          Alert.alert(
            "Error",
            "Ride or ride location not found. Please try again."
          );
        } else if (error.response && error.response.status === 400) {
          Alert.alert(
            "Error",
            error.response.data.error || "This ride is no longer available."
          );
        } else {
          Alert.alert(
            "Error",
            "An error occurred while getting location or accepting the ride. Please try again."
          );
        }
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };


  const handleAccept = () => {
    // Perform the accept logic here
    Alert.alert('Ride Accepted', `You accepted the ride with ${customer.name}.`);
    onClose();
  };

  // Function to handle decline action
  const handleDecline = () => {
    // Perform the decline logic here
    Alert.alert('Ride Declined', `You declined the ride with ${customer.name}.`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.header}>New Ride Match</Text>
          <Text style={styles.info}>Customer Name: {customer.name}</Text>
          <Text style={styles.info}>Pickup Location: {customer.pickupLocation}</Text>
          <Text style={styles.info}>Destination: {customer.dropoffLocation}</Text>
          <View style={styles.buttonContainer}>
            <Button title="Accept" onPress={handleAccept} color="#4CAF50" />
            <Button title="Decline" onPress={handleDecline} color="#F44336" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
});

export default MatchNotificationModal;
