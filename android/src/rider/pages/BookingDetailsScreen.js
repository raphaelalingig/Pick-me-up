import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from "react-native";
import userService from "../../services/auth&services"; 

const BookingDetailsScreen = ({ route, navigation }) => {
  const { ride } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await userService.getUserId();
        const id = parseInt(response, 10);
        console.log("Fetched user_id:", id);
        setUserId(id);
      } catch (error) {
        console.error("Error fetching user_id:", error);
      }
    };
  
    fetchUserId();
  }, []);
   

  const handleAccept = async (ride) => {
    if (!userId) {
      Alert.alert("Error", "User ID is not available.");
      return;
    }

    console.log("Attempting to accept ride with ID:", ride.ride_id);
    setIsLoading(true);
    try {
      const response = await userService.accept_ride(ride.ride_id); // Pass user_id with ride_id
      console.log("Accept ride response:", response.data);
      if (response.data && response.data.message) {
        Alert.alert("Success", response.data.message);
        navigation.navigate("Home", { ride });
      } else {
        Alert.alert("Error", "Failed to accept the ride. Please try again.");
      }
    } catch (error) {
      console.error("Failed to Accept Ride", error.response ? error.response.data : error.message);
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

  return (
    <ImageBackground
      source={{ uri: "https://your-map-image-url.com" }}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Booking Details</Text>
        <View style={styles.inputContainer}>
          <Text>Name: {`${ride.first_name} ${ride.last_name}`}</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text>Location: {ride.pickup_location}</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text>Service: {ride.ride_type}</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text>Drop off: {ride.dropoff_location}</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text>Fee: {ride.fare}</Text>
        </View>
        <TouchableOpacity
          style={styles.viewLocationButton}
          onPress={() => navigation.navigate("Booked Location", { ride })}
        >
          <Text style={styles.viewLocationButtonText}>View Location</Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAccept(ride)}
            disabled={isLoading}

          >
            <Text style={styles.acceptButtonText}>
              {isLoading ? "Accepting..." : "Accept"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
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
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#FFF",
  },
  acceptButton: {
    backgroundColor: "#158D01",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  acceptButtonText: {
    color: "#FFF",
  },
  viewLocationButton: {
    marginTop: 10,
  },
  viewLocationButtonText: {
    color: "black",
    padding: 5,
    textDecorationLine: "underline",
  },
});

export default BookingDetailsScreen;
