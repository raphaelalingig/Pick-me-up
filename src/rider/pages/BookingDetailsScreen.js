import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import userService from "../../services/auth&services";
import { BlurView } from "expo-blur";

const BookingDetailsScreen = ({ route, navigation }) => {
  const { ride } = route.params;
  const [riderLocation, setRiderLocation] = useState("");
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

  const handleApply = async (ride) => {
    if (!userId) {
      Alert.alert("Error", "User ID is not available.");
      return;
    }

    console.log("Attempting to accept ride with ID:", ride.ride_id);
    setIsLoading(true);

    const ride_id = ride.ride_id;
    const customer = ride.user_id;
    try {
      const response = await userService.apply_ride(ride_id, customer);
      console.log("Accept ride response:", response.data);
      if (response.data.message === "exist") {
        Alert.alert("Message", "You have already applied for this ride.");
        navigation.goBack();
      } else if (response.data.message === "applied") {
        Alert.alert("Message", "Applied Successfully!");
        navigation.goBack();
      } else if (response.data && response.data.message) {
        Alert.alert("Ride Match", "You have found a Match!");
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

  const handleViewLocation = () => {
    console.log("Navigating to Booked Location with ride data:", ride);
    navigation.navigate("Booked Location", { ride });
  };

  return (
    <ImageBackground
      source={require("../../pictures/4.png")}
      style={styles.background}
    >
      <BlurView style={styles.container} intensity={800} tint="light">
        <Text style={styles.title}>Booking Details</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.conntext}>Name: </Text>
          <Text>{`${ride.first_name} ${ride.last_name}`}</Text>
          <Text style={styles.conntext}>Location: </Text>
          <Text>{ride.pickup_location}</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.conntext}>Service:</Text>
          <Text>{ride.ride_type}</Text>
          <Text style={styles.conntext}>Drop off:</Text>
          <Text>{ride.dropoff_location}</Text>
        </View>

        <View style={styles.inputContainerFee}>
          <Text style={styles.conntext}>Fee: ₱{ride.fare}</Text>
        </View>
        <TouchableOpacity
          style={styles.viewLocationButton}
          onPress={handleViewLocation}
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
            onPress={() => {
              Alert.alert(
                "Confirm Application",
                "Are you sure you want to apply for this ride?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "OK",
                    onPress: () => handleApply(ride),
                  },
                ]
              );
            }}
            disabled={isLoading}
          >
            <Text style={styles.acceptButtonText}>
              {isLoading ? "Accepting..." : "Apply"}
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>
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
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.5)", // For the semi-transparent background
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
  },

  inputContainer: {
    padding: 10,
    width: "100%",
    marginBottom: 10,
    backgroundColor: "white",
    borderRadius: 8,
  },

  conntext: {
    fontWeight: "bold",
    fontSize: 16,
  },

  inputContainerFee: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
  },

  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#b22222",
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
    backgroundColor: "white",
    borderRadius: 10,
    textDecorationLine: "underline",
  },
});

export default BookingDetailsScreen;
