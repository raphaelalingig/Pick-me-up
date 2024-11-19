import { StyleSheet, TouchableOpacity, View, ImageBackground, Alert, Image, } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { Text } from "react-native-paper";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Importing icons
import userService from "../../services/auth&services";

const CompleteRide = ({ navigation, route }) => {
  const [bookDetails, setBookDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const role = "Customer";

  const fetchLatestRide = useCallback(async () => {
    setIsLoading(true);
    try {
      const ride = await userService.checkActiveBook();
      setBookDetails(ride.rideDetails);
      console.log(ride.rideDetails)
      setIsLoading(false);
    } catch (error) {
      Alert.alert("Error", "Failed to retrieve the latest available ride.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestRide();
  }, []);

  const handleReport = () => {
    navigation.navigate("Report", {
      ride: bookDetails,
      role
    });
  };

  const handleFeedback = () => {
    navigation.navigate("CustomerFeedback");
  };


  return (
    <ImageBackground
      source={require("../../pictures/9.png")}// Replace with your map image URL
      style={styles.background}
    >
      <View style={styles.overlay}>
        {/* Icon and MOTOR TAXI text */}
        <View style={styles.rideTypeContainer}>
          <View style={styles.rideTypeIconContainer}>
            <MaterialCommunityIcons name="motorbike" size={40} color="#333" />
          </View>
          <Text style={styles.rideTypeText}>MOTOR TAXI</Text>
        </View>

        {/* Circular Image Placeholder */}
        <View style={styles.imagePlaceholder}>
        <Image
          source={require("../../pictures/7.png")} // Replace with your image URL
          style={styles.image}
        />
      </View>

        {/* Arrival Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>You have Arrived</Text>
          <Text style={styles.subMessageText}>Thank you for using our services.</Text>
        </View>

        {/* Buttons: Report and Return Home */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={handleReport}
          >
            <Text style={styles.buttonText}>Report Rider</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.returnHomeButton}
            onPress={handleFeedback}
          >
            <Text style={styles.buttonText}>Submit Feedback</Text>
          </TouchableOpacity>
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
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Slight white overlay for readability
    justifyContent: "center",
    alignItems: "center",
  },
  // Ride type section
  rideTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    justifyContent: "center",
  },
  rideTypeIconContainer: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    elevation: 2,  // Slight shadow under the icon
  },
  rideTypeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',  // Yellow color for the title
  },
  // Image placeholder
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#FFD700',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },

  image: {
    width: '80%', // Adjust size as needed
    height: '80%', // Adjust size as needed
    borderRadius: 100, // Keep it circular
  },
  // Arrival message section
  messageContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subMessageText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  // Button section
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  reportButton: {
    backgroundColor: '#FF0000',  // Red for Report
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  returnHomeButton: {
    backgroundColor: '#158D01',  // Green for Return Home
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
});
