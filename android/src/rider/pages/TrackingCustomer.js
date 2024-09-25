import React, { useState, useEffect, useContext, useCallback } from "react";
import { StyleSheet, TouchableOpacity, View, ImageBackground, RefreshControl, ScrollView } from "react-native";
import { TextInput, Text } from "react-native-paper";

const TrackingCustomer = ({ route, navigation }) => {
  const { ride } = route.params;
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Navigate to Home screen
    navigation.navigate("Home", {ride});
    setRefreshing(false);
  }, [navigation]);

  
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ImageBackground
        source={{ uri: "https://your-map-image-url.com" }} // Replace with your map image URL
        style={styles.background}
      >
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.acceptButtonText}>Tracking Customer</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => navigation.navigate("Tracking Destination")}
              >
                <Text style={styles.acceptButtonText}>Begin Transit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => navigation.navigate("Home")}
              >
                <Text style={styles.acceptButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

export default TrackingCustomer;

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
