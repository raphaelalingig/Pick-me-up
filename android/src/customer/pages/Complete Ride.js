import { StyleSheet, TouchableOpacity, View, ImageBackground, Alert } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import userService from "../../services/auth&services";
import { Text } from "react-native-paper";

const CompleteRide = ({ navigation, route }) => {
  const { ride } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const completeRide = async () => {
    setIsLoading(true);
    try {
      const response = await userService.review_ride(ride.ride_id);
      if (response.data && response.data.message) {
        Alert.alert("Ride Complete", response.data.message);
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", "Failed to finish the ride. Please try again.");
      }
    } catch (error) {
      console.error("Failed to finish ride", error.response ? error.response.data : error.message);
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <ImageBackground
      source={{ uri: "https://your-map-image-url.com" }} // Replace with your map image URL
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.acceptButtonText}>You have arrived at your Destination! Thanks for using Pick Me Up!</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => navigation.navigate("Submit Report")}
            >
              <Text style={styles.acceptButtonText}>Report</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={completeRide}
            >
              <Text style={styles.acceptButtonText}>Return Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default CompleteRide;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Slight white overlay for better readability
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    padding: 20,
    backgroundColor: "#FFC533",
    borderRadius: 10,
    width: "90%",
    elevation: 5,
  },
  textinput: {
    backgroundColor: "white",
    width: "100%",
  },
  messageInput: {
    backgroundColor: "white",
    height: 100,
  },
  inputContainer: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  buttonContainer: {
    justifyContent: "flex-end",
    flexDirection: "row",
    marginTop: 20,
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
});
