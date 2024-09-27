import React, { useState, useEffect, useContext, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
  RefreshControl,
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

  const checkRideAndLocation = useCallback(async () => {
    try {
      const response = await userService.checkActiveRide();
      
      if (response && response.hasActiveRide) {
        const { status } = response.rideDetails;
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
    backgroundColor: "#FFD700",
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
});

export default Home;
