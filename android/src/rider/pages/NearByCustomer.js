import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  RefreshControl,
  Alert,
} from "react-native";
import FindingCustomerSpinner from "../spinner/FindingCustomerSpinner";
import NearbyCustomersMap from "./NearbyCustomersMap";
import userService from "../../services/auth&services";
import Pusher from "pusher-js/react-native";

const NearbyCustomerScreen = ({ navigation }) => {
  const [showSpinner, setShowSpinner] = useState(true);
  const [availableRides, setAvailableRides] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  const fetchAvailableRides = useCallback(async () => {
    try {
      const response = await userService.getAvailableRides();
      console.log('Fetched rides:', response.data);

      const sortedRides = response.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setAvailableRides(sortedRides);
      console.log(response.data)
      setShowSpinner(false);
    } catch (error) {
      console.error("Failed to fetch available rides:", error);
      setShowSpinner(false);
      Alert.alert("Error", "Failed to fetch available rides. Please try again.");
    }
  }, []);

  // Set up Pusher connection
  useEffect(() => {
    let pusher;
    try {
      // Initialize Pusher
      pusher = new Pusher('1b95c94058a5463b0b08', {
        cluster: 'ap1',
        forceTLS: true,
        encrypted: true,
      });

      // Subscribe to the channel
      const channel = pusher.subscribe('rides');

      // Debug connection state
      pusher.connection.bind('state_change', states => {
        console.log('Pusher state changed:', states);
      });

      pusher.connection.bind('connected', () => {
        console.log('Successfully connected to Pusher');
      });

      pusher.connection.bind('error', error => {
        console.error('Pusher connection error:', error);
      });

      // Listen for ride updates
      channel.bind('RIDES_UPDATE', data => {
        console.log('Received RIDES_UPDATE event:', data);
        if (data && Array.isArray(data.rides)) {
          const sortedRides = data.rides.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          setAvailableRides(sortedRides);
        }
      });
 
      // Fetch initial data
      fetchAvailableRides();

    } catch (error) {
      console.error('Error setting up Pusher:', error);
    }

    // Cleanup function
    return () => {
      if (pusher) {
        try {
          pusher.unsubscribe('rides');
          pusher.disconnect();
        } catch (error) {
          console.error('Error cleaning up Pusher:', error);
        }
      }
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setShowSpinner(true);
    await fetchAvailableRides();
    setRefreshing(false);
  }, [fetchAvailableRides]);

  const handleDetailsButtonPress = (ride) => {
    console.log("Details button pressed for ride:", ride.ride_id);
    navigation.navigate("BookingDetails", { ride });
  };

  const handleShowMap = () => {
    console.log("Available Rides:", availableRides);

    if (availableRides.length > 0) {
      setShowMap(true);
    } else {
      console.warn("No available rides to show on the map.");
    }
  };

  return (
    <>
      {showMap && (
        
        <NearbyCustomersMap
          availableRides={availableRides}
          onClose={() => setShowMap(false)}
          navigation={navigation}
        />
      )}
      
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ImageBackground
          source={require("../../pictures/13.png")}
          style={styles.background}
        >
          {showSpinner && (
            <View style={styles.spinnerContainer}>
              <FindingCustomerSpinner />
            </View>
          )}
          
          {!showSpinner && (
            <TouchableOpacity
              style={styles.mapButton}
              onPress={handleShowMap}
            >
              <Text style={styles.mapButtonText}>Show in Map</Text>
            </TouchableOpacity>
          )}

          {!showSpinner && availableRides.length === 0 && (
            <View style={styles.noRidesContainer}>
              <Text style={styles.noRidesText}>No rides available at the moment.</Text>
            </View>
          )}
          
          <ScrollView contentContainerStyle={styles.container}>
            {availableRides.map((ride, index) => (
              <View key={ride.ride_id || `ride-${index}`} style={styles.customerCard}>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerText}>
                    Name: {`${ride.first_name} ${ride.last_name}`}
                  </Text>
                  <Text style={styles.customerText}>Pickup: {ride.ride_type}</Text>
                </View>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={async () => {
                    await fetchAvailableRides();
                    handleDetailsButtonPress(ride);
                  }}
                >
                  <Text style={styles.detailsButtonText}>
                    Details
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </ImageBackground>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    opacity: 0.8,
    backgroundColor: "#FFD700",
  },
  container: {
    margin: 10,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  customerCard: {
    backgroundColor: "#FFD700", // Updated to yellow
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  customerInfo: {
    flex: 1,
  },
  customerText: {
    color: "#000",
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "bold",
    paddingLeft: 15,
  },
  detailsButton: {
    backgroundColor: "#000000",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  detailsButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  spinnerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 999,
  },
  noRidesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noRidesText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    padding: 10,
    backgroundColor: "black",
    borderRadius: 10,
  },
  mapButton: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NearbyCustomerScreen;
