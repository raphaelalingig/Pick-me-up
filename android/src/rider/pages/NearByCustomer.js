import React, { useState, useEffect, useContext, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  RefreshControl,
} from "react-native";
import FindingCustomerSpinner from "../spinner/FindingCustomerSpinner";
import userService from "../../services/auth&services"; // Adjust the import path as needed

const NearbyCustomerScreen = ({ navigation }) => {
  const [showSpinner, setShowSpinner] = useState(true);
  const [availableRides, setAvailableRides] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAvailableRides = useCallback(async () => {
    try {
      const response = await userService.getAvailableRides();

      // Sort the rides by date in descending order (oldest to latest)
      const sortedRides = response.data.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

      setAvailableRides(sortedRides);
      setShowSpinner(false);
    } catch (error) {
      console.error("Failed to fetch available rides:", error);
      setShowSpinner(false);
    }
  });

  const onRefresh = useCallback(async () => {
    await setRefreshing(true);
    setShowSpinner(true);
    await fetchAvailableRides();
    setRefreshing(false);
  }, [fetchAvailableRides]);

  // Automatically refresh when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchAvailableRides();
    }, [fetchAvailableRides])
  );

  const handleDetailsButtonPress = (ride) => {
    console.log("Details button pressed for ride:", ride.ride_id);
    navigation.navigate("BookingDetails", { ride });
  };

  return (
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
        {!showSpinner && availableRides.length === 0 && (
          <View style={styles.noRidesContainer}>
            <View style={styles.spinnerContainer}>
              <FindingCustomerSpinner />
            </View>
            <Text style={styles.noRidesText}></Text>
          </View>
        )}

        {availableRides.length > 0 && (
          <ScrollView contentContainerStyle={styles.container}>
            {availableRides.map((ride) => (
              <View key={ride.id} style={styles.customerCard}>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerText}>
                    Name: {`${ride.first_name} ${ride.last_name}`}
                  </Text>
                  <Text style={styles.customerText}>
                    Pickup: {ride.ride_type}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => handleDetailsButtonPress(ride)}
                >
                  <Text style={styles.detailsButtonText}>Details</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </ImageBackground>
    </ScrollView>
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
    color: "#000000",
  },
});

export default NearbyCustomerScreen;
