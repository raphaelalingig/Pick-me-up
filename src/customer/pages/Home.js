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
} from "react-native";
import { Text, Button } from "react-native-paper";
import { CustomerContext } from "../../context/customerContext";
import * as Location from "expo-location";
import userService from "../../services/auth&services";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons"; // For icons
import { BlurView } from "expo-blur";

const BookNow = ({ setCurrentForm, navigation, checkRideAndLocation }) => {
  const [loading, setLoading] = useState(false);

  const handleBookNow = async () => {
    setLoading(true);
    try {
      const user_status = await userService.fetchCustomer();
      if (user_status.message === "Account Disabled") {
        alert("Your account has been disabled! Contact Admin for more info.");
        return "Cannot Book";
      }
      console.log("User is verified and account is active.");

      const result = await checkRideAndLocation();
      if (result === "proceed") {
        setCurrentForm("ChooseServiceScreen");
      }
    } catch (error) {
      console.error("Error in handleBookNow:", error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../pictures/2.png")} // Replace with your map image URL or local asset
      style={styles.background}
    >
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text variant="titleLarge" style={styles.titleText}>
            PICKME UP
          </Text>
          <Text
            variant="titleSmall"
            style={{ color: "#FBC635", textAlign: "center" }}
          >
            Pick you up wherever you are.
          </Text>
        </View>

        <TouchableOpacity onPress={handleBookNow} disabled={loading}>
          <View
            style={{ padding: 15, backgroundColor: "black", borderRadius: 10 }}
          >
            <Text variant="titleMedium" style={styles.titleText}>
              {loading ? "Checking..." : "Book Now"}
            </Text>
          </View>
        </TouchableOpacity>
        <View>
          <Button>
            <Text
              style={{ textDecorationLine: "underline" }}
              onPress={() => navigation.navigate("Location")}
            >
              View Location
            </Text>
          </Button>
        </View>
      </View>
    </ImageBackground>
  );
};

const ChooseServiceScreen = ({ setCurrentForm, navigation }) => {
  const [selectedService, setSelectedService] = useState(null);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    handleBookPress();
  };

  const handleBookPress = () => {
    console.log("Serive: ",selectedService)
    // Alert before proceeding with the booking
    Alert.alert(
      "Confirm Booking",
      "Do you want to proceed with the booking?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Booking canceled"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            if (selectedService) {
              proceedWithBooking();
            }
          },
        },
      ]
    );
  };
  
  const proceedWithBooking = () => {
    navigation.navigate(selectedService); // Navigate to the selected service screen
  };

  return (
    <ImageBackground
      source={require("../../pictures/3.png")}
      style={styles.background}
    >
      <BlurView intensity={800} tint="light" style={styles.container}>
        <Text style={{ color: "black", fontSize: 18, fontWeight: "bold" }}>
          CHOOSE RIDER SERVICES
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.serviceButton,
              selectedService === "Motor Taxi" && styles.selectedButton,
            ]}
            onPress={() => {
              navigation.navigate("Motor Taxi");
            }}
          >
            <MaterialCommunityIcons name="motorbike" size={24} color="black" />
            <Text
              style={[
                styles.serviceButtonText,
                selectedService === "Motor Taxi" && { color: "black" },
              ]}
            >
              Moto-Taxi
            </Text>
            <Text style={styles.serviceDescription}>
              Bring you wherever you want
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.serviceButton,
              selectedService === "Delivery" && styles.selectedButton,
            ]}
            // onPress={() => handleServiceSelect("Delivery")}
            onPress={() =>
              navigation.navigate("Delivery")}
          >
            <MaterialCommunityIcons name="bike" size={24} color="black" />
            <Text
              style={[
                styles.serviceButtonText,
                selectedService === "Delivery" && { color: "black" },
              ]}
            >
              Delivery
            </Text>
            <Text style={styles.serviceDescription}>
              We deliver what you need
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.serviceButton,
              selectedService === "Pakyaw" && styles.selectedButton,
            ]}
            // onPress={() => handleServiceSelect("Pakyaw")}
            onPress={() =>
              navigation.navigate("Pakyaw")}
          >
            <FontAwesome5 name="users" size={24} color="black" />
            <Text
              style={[
                styles.serviceButtonText,
                selectedService === "Pakyaw" && { color: "black" },
              ]}
            >
              Pakyaw
            </Text>
            <Text style={styles.serviceDescription}>
              Ride with friend & family
            </Text>
          </TouchableOpacity>

        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setCurrentForm("BookNow")}
          >
            <Text style={styles.cancelButtonText}>CANCEL</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.bookButton} onPress={handleBookPress}>
            <Text style={styles.bookButtonText}>BOOK</Text>
          </TouchableOpacity> */}
        </View>
      </BlurView>
    </ImageBackground>
  );
};

const MainComponent = ({ navigation }) => {
  const [currentForm, setCurrentForm] = useState("BookNow");
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { customerCoords, setCustomerCoords } = useContext(CustomerContext);

  const checkRideAndLocation = useCallback(async () => {
    try {
      // Get location if no existing ride
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return "location_denied";
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      setCustomerCoords({
        accuracy: location.coords.accuracy,
        longitude: location.coords.longitude,
        latitude: location.coords.latitude,
        altitude: location.coords.altitude,
        altitudeAccuracy: location.coords.altitudeAccuracy,
        timestamp: location.timestamp,
      });

      const response = await userService.checkActiveBook();
      const ride = response.rideDetails;
      if (response && response.hasActiveRide) {
        const { status } = response.rideDetails;
        switch (status) {
          case "Available":
            navigation.navigate("WaitingForRider", { ride });
            return "existing_booking";
          case "Booked":
            navigation.navigate("Tracking Rider", { ride });
            return "existing_ride";
          case "In Transit":
            navigation.navigate("In Transit", { ride });
            return "in_transit";
          case "Review":
            navigation.navigate("To Review", { ride });
            return "review";
        }
      }

      return "proceed";
    } catch (error) {
      setErrorMsg("Error fetching location or ride status");
      return "error";
    }
  }, [navigation, setCustomerCoords]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkRideAndLocation();
    setRefreshing(false);
  }, [checkRideAndLocation]);

  // Automatically refresh when the screen is focused
  useFocusEffect(
    useCallback(() => {
      checkRideAndLocation();
    }, [checkRideAndLocation])
  );

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

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
      <View style={{ flex: 1 }}>
        {currentForm === "BookNow" ? (
          <BookNow
            setCurrentForm={setCurrentForm}
            navigation={navigation}
            checkRideAndLocation={checkRideAndLocation}
          />
        ) : (
          <ChooseServiceScreen
            setCurrentForm={setCurrentForm}
            navigation={navigation}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    padding: 20,
    backgroundColor: "black",
    borderRadius: 10,
  },
  contentContainer: {
    justifyContent: "space-around",
    alignItems: "center",
    height: "100%",
  },
  titleText: {
    fontWeight: "bold",
    color: "#FBC635",
    textAlign: "center",
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "space-evenly",
  },
  container: {
    backgroundColor: "rgba(255,215,0,0.5)", // For the semi-transparent background
    borderColor: "rgba(255,255,255,0.25)",
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  buttonContainer: {
    justifyContent: "space-around",
    marginBottom: 20,
    width: "100%", // Width set to 100%
  },
  serviceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "transparent",
    width: "100%", // Width set to 100%
  },
  serviceButtonText: {
    fontWeight: "bold",
    marginLeft: 10,
  },
  serviceDescription: {
    marginLeft: 15,
    color: "#555",
    flexShrink: 1,
  },
  selectedButton: {
    borderColor: "black",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  bookButton: {
    backgroundColor: "#008000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default MainComponent;
