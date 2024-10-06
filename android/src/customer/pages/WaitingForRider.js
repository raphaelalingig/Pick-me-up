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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"; // Importing icons
import userService from "../../services/auth&services";
import { BlurView } from "expo-blur";

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
      console.error(
        "Failed to Cancel Ride",
        error.response ? error.response.data : error.message
      );
      if (error.response && error.response.status === 400) {
        Alert.alert(
          "Error",
          error.response.data.error || "This ride is no longer available."
        );
        navigation.goBack();
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
        <Text style={styles.loadingText}>Loading...</Text>
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
        source={require("../../pictures/11.png")}
        style={styles.background}
      >
        {/* Ride Type Section */}
        <View style={styles.rideTypeContainer}>
          <MaterialCommunityIcons
            name="motorbike" // Motorbike icon for motor taxi
            size={30}
            color="#333" // Dark gray to match the text
          />
          <Text style={styles.rideTypeText}>{bookDetails.ride_type}</Text>
        </View>

        {/* Book Details Section */}
        <View style={styles.container}>
          <BlurView
            intensity={800}
            tint="light"
            style={styles.bookDetailsContainer}
          >
            <View style={styles.messageContainer}>
              <Text style={styles.successMessage}>
                Ride Successfully Booked
              </Text>
              <Text style={styles.statusMessage}>Looking for Rider...</Text>
            </View>

            <View style={styles.messageContainerBook}>
              <Text style={styles.subTitle}>Book Details</Text>
              <Text style={styles.detailText}>
                Type: {bookDetails.ride_type}
              </Text>
              <Text style={styles.detailText}>
                Pick Up: {bookDetails.pickup_location}
              </Text>
              <Text style={styles.detailText}>
                Drop Off: {bookDetails.dropoff_location}
              </Text>
            </View>

            <View style={styles.messageContainerFare}>
              <Text style={styles.subTitle}>Fare: ₱{bookDetails.fare}</Text>
            </View>
            <TouchableOpacity onPress={handleCancel}>
              <Button mode="contained" style={styles.cancelButton}>
                Cancel Ride
              </Button>
            </TouchableOpacity>
          </BlurView>
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
    justifyContent: "center",
    padding: 10,
  },
  // Ride type container with separation
  rideTypeContainer: {
    backgroundColor: "white",
    paddingVertical: 10,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row", // To align icon and text horizontally
    justifyContent: "center", // Center the icon and text together
    elevation: 3, // Adding slight elevation
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  rideTypeText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    marginLeft: 10, // Add spacing between icon and text
  },
  container: {
    flex: 1,
    padding: 10,
  },
  //yellow background and elevation
  bookDetailsContainer: {
    backgroundColor: "rgba(255,215,0,0.5)", // For the semi-transparent background
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
  },
  messageContainer: {
    alignItems: "center",
  },

  messageContainerBook: {
    padding: 20,
    backgroundColor: "white",
    alignItems: "flex-start",
    borderRadius: 8,
    marginBottom: 15,
  },

  messageContainerFare: {
    padding: 10,
    paddingTop: 16,
    borderRadius: 8,
    backgroundColor: "#f5f5dc",
    alignItems: "center",
  },

  successMessage: {
    fontSize: 21,
    color: "#000000",
    marginBottom: 10,
    fontWeight: "500",
  },
  statusMessage: {
    fontSize: 14,
    color: "black",
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: "#ff4d4f",
    borderRadius: 5,
    padding: 10,
  },
});

export default WaitingRider;
