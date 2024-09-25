import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Button, Text, ActivityIndicator, MD2Colors } from "react-native-paper";
import * as Location from "expo-location";
import { RiderContext } from "../../context/riderContext";
import userService from "../../services/auth&services";

const Home = ({ navigation, route }) => {
  const ride = route?.params?.ride || null;
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { riderCoords, setRiderCoords } = useContext(RiderContext);

  const checkRideAndLocation = useCallback(async () => {
    try {
      // Check for existing booking or ride
      const response = await userService.checkActiveRide();
      
      if (response && response.hasActiveRide) {
        
        const { status } = response.rideDetails;
        console.log("obdasddas",response.rideDetails)
        switch (status) {
          case 'Occupied':
            navigation.navigate("Tracking Customer", {ride});
            return "existing_ride";
          case 'InTransit':
            navigation.navigate("Tracking Destination");
            return "in_transit";
        }
      }

      // Get location if no existing ride
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
        setLoading(false); // Stop loading after fetching location
      }
    }, [navigation, setRiderCoords]);

    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      await checkRideAndLocation();
      setRefreshing(false);
    }, [checkRideAndLocation]);
  
    useEffect(() => {
      checkRideAndLocation();
    }, [checkRideAndLocation]);

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../pictures/Pick-Me-Up-Logo.png")} // Replace with the correct path to your logo image
          style={styles.logo}
        />
      </View>
      <Button
        mode="contained"
        style={styles.button}
        onPress={() => navigation.navigate("Nearby Customer")}
      >
        START FINDING CUSTOMER
      </Button>
      <Button
        disabled={loading}
        onPress={() => navigation.navigate("Current Location")}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {loading ? (
            <>
              <ActivityIndicator animating={true} color={MD2Colors.red800} />
              <Text style={{ marginLeft: 5 }}>Fetching coordinates...</Text>
            </>
          ) : (
            <Text
              style={{
                color: "black",
                padding: 5,
                textDecorationLine: "underline",
              }}
            >
              View Map
            </Text>
          )}
        </View>
      </Button>
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 50,
  },
  logo: {
    width: 150, // Adjust the width as needed
    height: 150, // Adjust the height as needed
    borderRadius: 75, // This will make the image circular if the width and height are equal
    borderWidth: 2,
    borderColor: "blue",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#FFD700", // Button background color
    padding: 10,
  },
  buttonLabel: {
    color: "#000", // Button text color
  },
  paragraph: {
    fontSize: 18,
    textAlign: "center",
  },
});

export default Home;
