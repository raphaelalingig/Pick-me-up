import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Button } from "react-native-paper";
import userService from '../../services/auth&services';

const WaitingRider = ({ navigation }) => {
  const [bookDetails, setBookDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLatestRide = async () => {
    try {
      const ride = await userService.checkActiveBook();
      setBookDetails(ride.rideDetails);
    } catch (error) {
      Alert.alert("Error", "Failed to retrieve the latest available ride.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestRide();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Navigate to Home screen
    navigation.navigate("Home");
    setRefreshing(false);
  }, [navigation]);

  const handleCancel = async () => {
    console.log("Attempting to cancel ride");
    
    setIsLoading(true);
    try {
      const response = await userService.cancel_ride(bookDetails.ride_id);
      console.log("Cancel ride response:", response.data);
  
      if (response.data && response.data.message) {
        Alert.alert("Success", response.data.message);
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", "Failed to cancel the ride. Please try again.");
      }
    } catch (error) {
      console.error("Failed to Cancel Ride", error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 400) {
        Alert.alert("Error", error.response.data.error || "This ride is no longer available.");
        navigation.goBack(); // Go back to the previous screen
      } else {
        Alert.alert("Error", "An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !bookDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ImageBackground
        source={{ uri: "https://your-map-image-url.com" }}
        style={styles.background}
      >
        <View style={styles.container}>
          <Text style={styles.title}>{bookDetails.ride_type}</Text>
          <View style={styles.messageContainer}>
            <Text style={styles.successMessage}>Ride Successfully Booked</Text>
            <Text style={styles.statusMessage}>Looking for Rider...</Text>
            <Text style={styles.subTitle}>Book Details</Text>
            <Text style={styles.detailText}>Type: {bookDetails.ride_type}</Text>
            <Text style={styles.detailText}>Pick Up Location: {bookDetails.pickup_location}</Text>
            <Text style={styles.detailText}>Drop Off Location: {bookDetails.dropoff_location}</Text>
            <Text style={styles.detailText}>Fare: {bookDetails.fare}</Text>
          </View>
          <View>
            <TouchableOpacity onPress={handleCancel}>
              <Button style={styles.returnHomeButton}>
                <Text style={{ color: "white" }}>Cancel Ride</Text>
              </Button>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    backgroundColor: "#FFD700",
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  messageContainer: {
    alignItems: "center",
  },
  successMessage: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  statusMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 5,
  },
  returnHomeButton: {
    marginTop: 20,
    backgroundColor: "#140F1F",
    borderRadius: 5,
    justifyContent: "flex-end",
  },
});

export default WaitingRider;