import React, { useState, useEffect, useContext, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Animated,
} from "react-native";
import Toast from "react-native-root-toast";
import { Text, Surface } from "react-native-paper";
import { RiderContext } from "../../context/riderContext";
import * as Location from "expo-location";
import userService from "../../services/auth&services";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import ApplyRideModal from "./ApplyRideModal";
import { usePusher } from "../../context/PusherContext";
import usePusher1 from "../../services/pusher";
import * as Clipboard from "expo-clipboard";

const { width } = Dimensions.get("window");

const Home = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { riderCoords, setRiderCoords } = useContext(RiderContext);
  const [user_id, setUser_Id] = useState();
  const [isOnline, setIsOnline] = useState(false);
  const [statusAnimation] = useState(new Animated.Value(0));
  const pusher = usePusher1();
  const { showApplyModal, setShowApplyModal, applyRide, setApplyRide } =
    usePusher();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await userService.getUserId();
        const id = parseInt(response, 10);
        console.log("youvouyvouyFetched user_id:", id);
        setUser_Id(id);
      } catch (error) {
        console.error("Error fetching user_id:", error);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchUserAvailability = async () => {
      try {
        const availability = await userService.fetchRider();
        console.log("Availabilty", availability);
        setIsOnline(availability.availability === "Available");
      } catch (error) {
        console.error("Error fetching user availability:", error);
      }
    };
    fetchUserAvailability();
  }, []);

  const handleStatusToggle = async (value) => {
    try {
      setLoading(true);

      // Send status dynamically based on the toggle value
      const newStatus = value ? "Available" : "Offline";
      await userService.updateRiderOnlineStatus(newStatus);

      // Animate the status change
      Animated.sequence([
        Animated.timing(statusAnimation, {
          toValue: value ? 1 : 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setIsOnline(value); // Update the state to reflect the new status

      console.log(`Showing toast: You are now ${newStatus.toLowerCase()}!`);
      Toast.show(`You are now ${newStatus.toLowerCase()}!`, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        backgroundColor: "#333",
        textColor: "#fff",
      });
      // Optional feedback (commented out in your code)
      // Alert.alert("Status Updated", `You are now ${newStatus.toLowerCase()}!`);
    } catch (error) {
      Alert.alert("Error", "Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const setupPusher = async () => {
      try {
        if (!user_id) return;
        const bookedChannel = pusher.subscribe("booked");
        const progressChannel = pusher.subscribe("progress");

        bookedChannel.bind("BOOKED", (data) => {
          console.log("MATCHED DATA received:", data);
          console.log(user_id);
          console.log("APPLIER", data.ride.applier);
          if (data.ride.applier === user_id) {
            Alert.alert("Ride Match", "You have found a Match!");
            navigation.navigate("Home");
          }
        });

        progressChannel.bind("RIDE_PROG", (data) => {
          console.log("Progress DATA received:", data);
          if (data.update.id === user_id) {
            if (data.update.status === "Pakyaw") {
              checkRideAndLocation();
            }
          }
        });

        return () => {
          progressChannel.unbind_all();
          bookedChannel.unbind_all();
          pusher.unsubscribe("booked");
        };
      } catch (error) {
        console.error("Error setting up Pusher:", error);
      }
    };

    setupPusher();
  }, [user_id]);

  useEffect(() => {
    const checkUserStatus = async () => {
      setLoading(true);
      try {
        const user_status = await userService.fetchRider();
        if (
          user_status.message === "Get Verified" ||
          user_status.message === "Account Disabled"
        ) {
          handleFind(user_status.message);
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "Unable to process your request. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [isOnline]);

  const handleFind = async () => {
    setLoading(true);
    try {
      const user_status = await userService.fetchRider();
      if (user_status.message === "Get Verified") {
        Alert.alert(
          "Verification Required",
          "Please complete your verification process before looking for customers. Please contact Admin for more information",
          [
            {
              text: "Copy Address",
              onPress: () => {
                Clipboard.setStringAsync("pickmeupadmin@gmail.com");
                Alert.alert("Copied", "Email address copied to clipboard.");
              },
            },
            { text: "OK", onPress: () => {} },
          ]
        );
        return "Cannot Book";
      }
      if (user_status.message === "Account Disabled") {
        Alert.alert(
          "Account Disabled",
          "Your account has been disabled. Please contact Admin for more information",
          [
            {
              text: "Copy Address",
              onPress: () => {
                Clipboard.setStringAsync("pickmeupadmin@gmail.com");
                Alert.alert("Copied", "Email address copied to clipboard.");
              },
            },
            { text: "OK", onPress: () => {} },
          ]
        );
        return "Cannot Book";
      }
      navigation.navigate("Nearby Customer");
      return "Proceed";
    } catch (error) {
      Alert.alert("Error", "Unable to process your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const uploadRiderLocation = async (rider_lat, rider_long) => {
    console.log("COORDS", rider_lat, rider_long);
    try {
      const response = await userService.updateRiderLocation(
        rider_lat,
        rider_long
      );
      console.log("Updated Succesfully:", response);
    } catch (error) {
      console.error("Error uploading rider location:", error);
    }
  };

  const handleStartPakyaw = async (ride) => {
    if (!ride?.ride_id) {
      Alert.alert("Error", "No ride found to start.");
      return;
    }

    try {
      const response = await userService.startPakyaw(ride.ride_id);
      console.log("Start Pakyaw Response:", response);

      if (response?.message) {
        Alert.alert("Success", response.message, [
          { text: "OK", onPress: () => checkRideAndLocation() },
        ]);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to start Pakyaw.";
      Alert.alert("Error", errorMessage);
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

      const rider_lat = location.coords.latitude;
      const rider_long = location.coords.longitude;
      uploadRiderLocation(rider_lat, rider_long);

      const response = await userService.checkActiveRide();
      console.log(response);
      if (response && response.hasActiveRide) {
        const { status } = response.rideDetails;
        console.log("RIDER HOME STATUS", status);
        const ride = response.rideDetails;
        switch (status) {
          case "Start":
            Alert.alert(
              "Pakyaw Start Request",
              "Your Passenger requested to Start the Pakyaw Ride!",
              [
                {
                  text: "Decline",
                  onPress: () => console.log("Ride declined"), // Handle decline logic if needed
                  style: "cancel",
                },
                {
                  text: "Accept",
                  onPress: () => {
                    handleStartPakyaw(ride);
                  },
                },
              ],
              { cancelable: false }
            );
            return "existing_ride";
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkRideAndLocation();
      setShowApplyModal(false);
      // setShowMatchModal(false);
    }, [])
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
      <LinearGradient
        colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
        style={styles.gradientOverlay}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.statusBar}>
            <View style={styles.statusContainer}>
              <MaterialCommunityIcons
                name={isOnline ? "circle" : "circle-outline"}
                size={24}
                color={isOnline ? "#4CAF50" : "#FBC635"}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isOnline ? "#4CAF50" : "#FBC635" },
                ]}
              >
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isOnline && styles.toggleButtonActive,
              ]}
              onPress={() => handleStatusToggle(!isOnline)}
            >
              <Text style={styles.toggleButtonText}>
                {isOnline ? "GO OFFLINE" : "GO ONLINE"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.contentContainer}>
              <Surface style={styles.logoContainer} elevation={5}>
                <Text style={styles.logoText}>PICKME UP</Text>
                <Text style={styles.taglineText}>
                  Ready to serve, anytime, anywhere
                </Text>
              </Surface>

              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={[
                    styles.findButton,
                    !isOnline && styles.findButtonDisabled,
                  ]}
                  onPress={handleFind}
                  disabled={loading || !isOnline}
                >
                  <LinearGradient
                    colors={["#FBC635", "#FDA429"]}
                    style={styles.gradientButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.findButtonText}>
                      {loading ? "CHECKING..." : "FIND CUSTOMERS"}
                    </Text>
                    {!loading && (
                      <MaterialCommunityIcons
                        name="map-marker-radius"
                        size={24}
                        color="black"
                        style={styles.buttonIcon}
                      />
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewLocationButton}
                  onPress={() => navigation.navigate("Current Location")}
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={24}
                    color="#FBC635"
                  />
                  <Text style={styles.viewLocationText}>
                    View Current Location
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {applyRide && (
            <ApplyRideModal
              visible={showApplyModal}
              ride={applyRide}
              userService={userService}
              navigation={navigation}
              onClose={() => setShowApplyModal(false)}
            />
          )}
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  gradientOverlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(0,0,0,0.8)",
    marginTop: StatusBar.currentHeight,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  toggleButton: {
    backgroundColor: "#FBC635",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toggleButtonActive: {
    backgroundColor: "#4CAF50",
  },
  toggleButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 14,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 40,
  },
  logoContainer: {
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 50,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FBC635",
    letterSpacing: 2,
  },
  taglineText: {
    fontSize: 16,
    color: "#FBC635",
    marginTop: 10,
    fontWeight: "500",
  },
  actionContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 50,
  },
  findButton: {
    width: "90%",
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 20,
  },
  findButtonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  findButtonText: {
    fontSize: 20,
    fontWeight: "800",
    color: "black",
    marginRight: 10,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  viewLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  viewLocationText: {
    color: "#FBC635",
    fontSize: 16,
    marginLeft: 8,
    textDecorationLine: "underline",
  },
});

export default Home;
