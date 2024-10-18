import React, { useState, useEffect, useContext, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Button, Text, ActivityIndicator, MD2Colors } from "react-native-paper";
import * as Location from "expo-location";
import { RiderContext } from "../../context/riderContext";
import userService from "../../services/auth&services";

const Home = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { riderCoords, setRiderCoords } = useContext(RiderContext);

  const handleFind = async () => {
    setLoading(true);
    try {
      const user_status = await userService.fetchRider();
  
      // Check if the response indicates "Get Verified"
      if (user_status.message === "Get Verified") {
        alert("Please complete your verification process before booking a ride.");
        return "Cannot Book";
      }
  
      // Check if the response indicates "Account Disabled"
      if (user_status.message === "Account Disabled") {
        alert("Your account has been disabled! Contact Admin for more info.");
        return "Cannot Book";
      }
  
      // If everything is fine, proceed with finding a customer
      console.log("User is verified and account is active.");
      navigation.navigate("Nearby Customer");
      // Your additional logic to start finding a customer goes here
      return "Proceed";
  
    } catch (error) {
      console.error("Error in Finding Customer:", error);
      // Show an error message to the user
      alert("An error occurred while checking your status. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const checkRideAndLocation = useCallback(async () => {
    try {
      const response = await userService.checkActiveRide();
      if (response && response.hasActiveRide) {
        const { status } = response.rideDetails;
        console.log(status)
        const ride = response.rideDetails; 
        switch (status) {
          case 'Booked':
            navigation.navigate("Tracking Customer", {ride});
            return "existing_ride";
          case 'In Transit':
            navigation.navigate("Tracking Destination", {ride});
            return "in_transit";
        }
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return "location_denied";
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      setRiderCoords({
        accuracy: location.coords.accuracy,
        longitude: location.coords.longitude,
        latitude: location.coords.latitude,
        altitude: location.coords.altitude,
        altitudeAccuracy: location.coords.altitudeAccuracy,
        timestamp: location.timestamp,
      });

      return "proceed";
    } catch (error) {
      setErrorMsg("Error fetching location or ride status");
      } finally {
        setLoading(false);
      }
  }, [navigation, setRiderCoords]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkRideAndLocation();
    setRefreshing(false);
  }, [checkRideAndLocation]);

  useFocusEffect(
    useCallback(() => {
      checkRideAndLocation();
    }, [checkRideAndLocation])
  );

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <ImageBackground
      source={require("../../pictures/2.png")}
      style={styles.background}
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../pictures/Pick-Me-Up-Logo.png")}
              style={styles.logo}
            />
          </View>
          <TouchableOpacity onPress={handleFind} disabled={loading}>
            <View
              style={{ padding: 15, backgroundColor: "black", borderRadius: 10 }}
            >
              <Text variant="titleMedium" style={styles.titleText}>
                {loading ? "Checking..." : "START FINDING CUSTOMER"}
              </Text>
            </View>
          </TouchableOpacity>
          <Button
            disabled={loading}
            onPress={() => navigation.navigate("Current Location")}
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <>
                  <ActivityIndicator
                    animating={true}
                    color={MD2Colors.red800}
                  />
                  <Text style={styles.buttonText}>Fetching coordinates...</Text>
                </>
              ) : (
                <Text style={styles.mapButtonText}>View Map</Text>
              )}
            </View>
          </Button>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 50,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "blue",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#000000",
    padding: 10,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    marginLeft: 5,
    color: "black",
  },
  mapButtonText: {
    color: "black",
    padding: 5,
    textDecorationLine: "underline",
  },

  titleText: {
    fontWeight: "bold",
    color: "#FBC635",
    textAlign: "center",
  },
});

export default Home;
