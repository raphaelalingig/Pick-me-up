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
  Modal,
  Alert,
} from "react-native";
import Toast from "react-native-root-toast";

import { Button, Text, ActivityIndicator, MD2Colors } from "react-native-paper";
import * as Location from "expo-location";
import { RiderContext } from "../../context/riderContext";
import userService from "../../services/auth&services";
import usePusher from "../../services/pusher";

const Home = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { riderCoords, setRiderCoords } = useContext(RiderContext);
  const [user_id, setUserId] = useState();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyRide, setApplyRide] = useState(null);
  const pusher = usePusher();

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

  useEffect(() => {
    const setupPusher = async () => {
      try {
        if (!user_id) return;
        const appliedChannel = pusher.subscribe("application");
        const bookedChannel = pusher.subscribe("booked");

        appliedChannel.bind("RIDES_APPLY", (data) => {
          console.log("Data received:", data);
          if (data && data.applicationData && data.applicationData.length > 0) {
            const apply = data.applicationData[0];
            console.log("Applying user ID check", apply.apply_to, user_id);
            if (apply.apply_to === user_id) {
              setApplyRide(apply);
              setShowApplyModal(true);
              console.log("Modal should now be visible");
            }
          }
        });

        bookedChannel.bind("BOOKED", (data) => {
          if (data && data.ride && data.ride.length > 0) {
            const book = data.ride[0];
            if (book.apply_to === user_id) {
              setMatchedRide(book);
              setShowMatchModal(true);
            }
          }
        });

        return () => {
          appliedChannel.unbind_all();
          pusher.unsubscribe("application");
          pusher.unsubscribe("booked");
        };
      } catch (error) {
        console.error("Error setting up Pusher:", error);
      }
    };

    setupPusher();
  }, [user_id]);

  const handleDecline = async () => {
    try {
      // setShowSpinner(true);

      const apply_id = applyRide.apply_id;
      const response = await userService.decline_ride(apply_id);

      if (response.data.message == "Declined") {
        Toast.show("Declined Ride Successfully", {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          hideOnPress: true,
          backgroundColor: "#333",
          textColor: "#fff",
        });
        setShowApplyModal(false);
        setApplyRide(null);
      } else if (response.data.message == "Unavailable") {
        Toast.show("Ride no longer available", {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          hideOnPress: true,
          backgroundColor: "#333",
          textColor: "#fff",
        });
        setShowApplyModal(false);
        setApplyRide(null);
      }
    } catch (error) {
      console.error("Failed to decline ride:", error);
      Alert.alert("Error", "Failed to decline ride. Please try again.");
    } finally {
      // setShowSpinner(false);
    }
  };

  const handleCancelConfirmation = useCallback(() => {
    Alert.alert("Decline Ride", "Are you sure you want to decline this ride?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: handleDecline,
        style: "destructive",
      },
    ]);
  }, [handleDecline]);

  const handleViewButton = () => {
    setShowApplyModal(false);
    navigation.navigate("BookingDetails", { ride: applyRide });
  };

  const closeApplyModal = () => {
    setShowApplyModal(false);
    setApplyRide(null);
  };

  const handleFind = async () => {
    setLoading(true);
    try {
      const user_status = await userService.fetchRider();
      if (user_status.message === "Get Verified") {
        alert(
          "Please complete your verification process before booking a ride."
        );
        return "Cannot Book";
      }
      if (user_status.message === "Account Disabled") {
        alert("Your account has been disabled! Contact Admin for more info.");
        return "Cannot Book";
      }
      console.log("User is verified and account is active.");
      navigation.navigate("Nearby Customer");
      return "Proceed";
    } catch (error) {
      console.error("Error in Finding Customer:", error);
      alert("An error occurred while checking your status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkRideAndLocation = useCallback(async () => {
    try {
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

      const response = await userService.checkActiveRide();
      console.log(response);
      if (response && response.hasActiveRide) {
        const { status } = response.rideDetails;
        console.log(status);
        const ride = response.rideDetails;
        switch (status) {
          case "Booked":
            navigation.navigate("Tracking Customer", { ride });
            return "existing_ride";
          case "In Transit":
            navigation.navigate("Tracking Destination", { ride });
            return "in_transit";
        }
      }

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
      setShowApplyModal(false);
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
              source={require("../../pictures/icon.png")}
              style={styles.logo}
            />
          </View>
          <TouchableOpacity onPress={handleFind} disabled={loading}>
            <View
              style={{
                padding: 15,
                backgroundColor: "black",
                borderRadius: 10,
              }}
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

          {applyRide && (
            <Modal
              visible={showApplyModal}
              transparent={true}
              animationType="slide"
              onRequestClose={closeApplyModal}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>New Ride Application!</Text>
                  <Text style={styles.modalText}>
                    Passenger: {applyRide.applier_name}
                  </Text>
                  <Text style={styles.modalText}>
                    Calculated Fare: {applyRide.calculated_fare}
                  </Text>
                  <Text style={styles.modalText}>
                    Offered Fare: {applyRide.fare}
                  </Text>
                  <Text style={styles.modalText}>
                    Date: {new Date(applyRide.ride_date).toLocaleString()}
                  </Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={handleViewButton}
                    >
                      <Text style={styles.buttonText1}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.declineButton]}
                      onPress={handleCancelConfirmation}
                    >
                      <Text style={styles.buttonText1}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          )}
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
    borderWidth: 2,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginVertical: 5,
  },
  rideDetails: {
    marginTop: 10,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  declineButton: {
    backgroundColor: "#FF5252",
  },
  buttonText1: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Home;
