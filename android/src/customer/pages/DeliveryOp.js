import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useAuth } from "../../services/useAuth";
import userService from "../../services/auth&services";
import AsyncStorage from '@react-native-async-storage/async-storage';

const DeliveryOptionScreen = ({ navigation }) => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [fare, setFare] = useState("50.00");
  const [userId, setUserId] = useState(null); // Changed to userId

  useEffect(() => {
    const fetchUserId = async () => {
      const response = await userService.getUserId();
      const id = parseInt(response, 10)
      setUserId(id);
      
    };

    fetchUserId();
  }, []);

  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Add 1 because months are zero-based
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');

  // Format the date as YYYY-MM-DD HH:mm:ss
  const formattedCurrentDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

console.log(formattedCurrentDate); 
 
  const handleConfirm = async () => {
    
    const bookDetails = {
      user_id: userId, // Logged-in user's ID
      ride_date: formattedCurrentDate,
      ride_type: "Delivery",
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      fare: parseFloat(fare),
      status: "Available",
    };

    console.log("Array:", bookDetails);
    console.log("Type:", typeof bookDetails);
    console.log(JSON.stringify(bookDetails, null, 2));

    try {
      const response = await userService.book(bookDetails);
      console.log("Booked Successfully:", response.data);
      navigation.navigate("WaitingForRider", { bookDetails });
    } catch (error) {
      console.error("Failed to add ride history:", error);
    }
  };

  return (
    <ImageBackground
    source={require("../../pictures/3.png")} // Replace with your map image URL or local asset
    style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Delivery</Text>
        <TextInput
          style={styles.input}
          placeholder="Item pick up location"
          value={pickupLocation}
          onChangeText={setPickupLocation}
        />
        <TextInput
          style={styles.input}
          placeholder="Item drop off destination"
          value={dropoffLocation}
          onChangeText={setDropoffLocation}
        />
        <TextInput
          style={styles.input}
          placeholder="Fare"
          keyboardType="numeric"
          value={fare}
          onChangeText={setFare}
        />
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
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
  header: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
  },
  menuButton: {
    padding: 10,
  },
  menuButtonText: {
    fontSize: 24,
  },
  container: {
    backgroundColor: "#FFD700",
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 5, // For Android shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "#008000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DeliveryOptionScreen;
