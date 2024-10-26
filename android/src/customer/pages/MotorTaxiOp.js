import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Alert,
  FlatList,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import { CustomerContext } from "../../context/customerContext";
import userService from "../../services/auth&services";
import { BlurView } from "expo-blur";

const GOOGLE_PLACES_API_KEY = "AIzaSyAekXSq_b4GaHneUKEBVsl4UTGlaskobFo";

const PlaceSuggestion = ({ suggestion, onPress }) => (
  <TouchableOpacity
    style={styles.suggestionItem}
    onPress={() => onPress(suggestion)}
  >
    <Text>{suggestion.description}</Text>
  </TouchableOpacity>
);

const MotorTaxiOptionScreen = ({ navigation, route }) => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [fare, setFare] = useState("40.00");
  const [userId, setUserId] = useState(null);
  const { customerCoords, setCustomerCoords } = useContext(CustomerContext);
  const [totalDistanceRide, setTotalDistanceRide] = useState(0);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const pickupTimeoutRef = useRef(null);
  const dropoffTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const response = await userService.getUserId();
      const id = parseInt(response, 10);
      setUserId(id);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (route.params?.selectedLocation && route.params?.address) {
      const { latitude, longitude } = route.params.selectedLocation;
      const location = `${latitude}, ${longitude}`;
      const address = route.params.address;

      if (route.params.locationType === "pickup") {
        setPickupLocation(location);
        setPickupAddress(address);
      } else if (route.params.locationType === "dropoff") {
        setDropoffLocation(location);
        setDropoffAddress(address);
      }

      // Calculate distance and update fare when both pickup and dropoff are set
      if (pickupLocation && dropoffLocation) {
        fetchDirectionsAndUpdateFare();
      }
    }
  }, [
    route.params?.selectedLocation,
    route.params?.address,
    route.params?.locationType,
    pickupLocation,
    dropoffLocation,
  ]);

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setCustomerCoords({
      accuracy: location.coords.accuracy,
      longitude: location.coords.longitude,
      latitude: location.coords.latitude,
      altitude: location.coords.altitude,
      altitudeAccuracy: location.coords.altitudeAccuracy,
      timestamp: location.timestamp,
    });

    const newPickupLocation = `${location.coords.latitude}, ${location.coords.longitude}`;
    setPickupLocation(newPickupLocation);

    // Get address for current location
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (result.length > 0) {
        const { street, city, region, country } = result[0];
        const formattedAddress = `${street}, ${city}, ${region}, ${country}`;
        setPickupAddress(formattedAddress);
      }
    } catch (error) {
      console.error("Error getting address:", error);
      setPickupAddress("Address not found");
    }

    // Calculate distance and update fare if dropoff is set
    if (dropoffLocation) {
      fetchDirectionsAndUpdateFare(newPickupLocation, dropoffLocation);
    }
  };

  const chooseFromMap = (locationType) => {
    navigation.navigate("MapPicker", { locationType });
  };

  const fetchDirectionsAndUpdateFare = async (
    pickup = pickupLocation,
    dropoff = dropoffLocation
  ) => {
    if (!pickup || !dropoff) {
      console.log("Pickup or dropoff location is missing");
      return;
    }

    try {
      const apiKey = "AIzaSyAekXSq_b4GaHneUKEBVsl4UTGlaskobFo";
      const [pickupLat, pickupLng] = pickup.split(",");
      const [dropoffLat, dropoffLng] = dropoff.split(",");
      const origin = `${pickupLat},${pickupLng}`;
      const destination = `${dropoffLat},${dropoffLng}`;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.routes.length) {
        const totalDistanceMeters = result.routes[0].legs.reduce(
          (sum, leg) => sum + leg.distance.value,
          0
        );
        const totalDistanceKm = (totalDistanceMeters / 1000).toFixed(2);
        setTotalDistanceRide(totalDistanceKm);
        calculateFare(totalDistanceKm);
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
      Alert.alert("Error", "Failed to calculate distance. Please try again.");
    }
  };

  const calculateFare = (distance) => {
    const baseFare = 40;
    const additionalFareRate = 10;
    const thresholdKm = 2;

    let calculatedFare;
    if (distance <= thresholdKm) {
      calculatedFare = baseFare;
    } else {
      const exceedingDistance = distance - thresholdKm;
      calculatedFare = baseFare + exceedingDistance * additionalFareRate;
    }

    setFare(calculatedFare.toFixed(2));
  };

  const handleConfirm = async () => {
    const currentDate = new Date();
    const formattedCurrentDate = currentDate
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const bookDetails = {
      user_id: userId,
      ride_date: formattedCurrentDate,
      ride_type: "Motor Taxi",
      pickup_location: pickupAddress,
      dropoff_location: dropoffAddress,
      fare: parseFloat(fare),
      status: "Available",
    };

    const [pickupLat, pickupLng] = pickupLocation.split(",");
    const [dropoffLat, dropoffLng] = dropoffLocation.split(",");

    const rideLocationDetails = {
      user_id: userId,
      customer_latitude: parseFloat(pickupLat),
      customer_longitude: parseFloat(pickupLng),
      dropoff_latitude: parseFloat(dropoffLat),
      dropoff_longitude: parseFloat(dropoffLng),
    };

    try {
      const response = await userService.book(bookDetails);
      console.log("Booked Successfully:", response.data);
      await userService.saveBookLocation(rideLocationDetails);
      navigation.navigate("WaitingForRider", { bookDetails });
    } catch (error) {
      console.error("Failed to add ride history or save ride location:", error);
      Alert.alert("Booking Failed", "Please try again later.");
    }
  };

  const fetchPlaceSuggestions = async (input, setStateFn) => {
    if (input.length > 2) {
      const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${GOOGLE_PLACES_API_KEY}&components=country:ph&location=8.4542,124.6319&radius=50000`;
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.predictions) {
          setStateFn(data.predictions);
        }
      } catch (error) {
        console.error("Error fetching place suggestions:", error);
      }
    } else {
      setStateFn([]);
    }
  };

  const handlePickupInputChange = (text) => {
    setPickupAddress(text);
    if (pickupTimeoutRef.current) clearTimeout(pickupTimeoutRef.current);
    pickupTimeoutRef.current = setTimeout(() => {
      fetchPlaceSuggestions(text, setPickupSuggestions);
    }, 300);
  };

  const handleDropoffInputChange = (text) => {
    setDropoffAddress(text);
    if (dropoffTimeoutRef.current) clearTimeout(dropoffTimeoutRef.current);
    dropoffTimeoutRef.current = setTimeout(() => {
      fetchPlaceSuggestions(text, setDropoffSuggestions);
    }, 300);
  };

  const handleSuggestionPress = async (suggestion, locationType) => {
    const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.place_id}&fields=geometry&key=${GOOGLE_PLACES_API_KEY}`;
    try {
      const response = await fetch(placeDetailsUrl);
      const data = await response.json();
      if (
        data.result &&
        data.result.geometry &&
        data.result.geometry.location
      ) {
        const { lat, lng } = data.result.geometry.location;
        const location = `${lat}, ${lng}`;
        if (locationType === "pickup") {
          setPickupLocation(location);
          setPickupAddress(suggestion.description);
          setPickupSuggestions([]);
        } else {
          setDropoffLocation(location);
          setDropoffAddress(suggestion.description);
          setDropoffSuggestions([]);
        }
        if (pickupLocation && dropoffLocation) {
          fetchDirectionsAndUpdateFare();
        }
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <ImageBackground
        source={require("../../pictures/3.png")}
        style={styles.background}
      >
        <BlurView intensity={800} tint="light" style={styles.container}>
          <Text style={styles.title}>Motor-Taxi</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Pick me up from"
              value={pickupAddress}
              onChangeText={handlePickupInputChange}
            />
            {pickupSuggestions.length > 0 && (
              <FlatList
                data={pickupSuggestions}
                renderItem={({ item }) => (
                  <PlaceSuggestion
                    suggestion={item}
                    onPress={(suggestion) =>
                      handleSuggestionPress(suggestion, "pickup")
                    }
                  />
                )}
                keyExtractor={(item) => item.place_id}
                style={styles.suggestionList}
              />
            )}
            <View style={styles.locationButtonsContainer}>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={getCurrentLocation}
              >
                <Text style={styles.locationButtonText}>
                  Use current location
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={() => chooseFromMap("pickup")}
              >
                <Text style={styles.locationButtonText}>Choose from map</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Destination"
              value={dropoffAddress}
              onChangeText={handleDropoffInputChange}
            />
            {dropoffSuggestions.length > 0 && (
              <FlatList
                data={dropoffSuggestions}
                renderItem={({ item }) => (
                  <PlaceSuggestion
                    suggestion={item}
                    onPress={(suggestion) =>
                      handleSuggestionPress(suggestion, "dropoff")
                    }
                  />
                )}
                keyExtractor={(item) => item.place_id}
                style={styles.suggestionList}
              />
            )}
            <View style={styles.locationButtonsContainer}>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={() => chooseFromMap("dropoff")}
              >
                <Text style={styles.locationButtonText}>Choose from map</Text>
              </TouchableOpacity>
            </View>
          </View>
  
          <View style={styles.fareContainer}>
            <Text style={styles.fareLabel}>Estimated Fare:</Text>
            <TextInput
              style={styles.fareInput}
              value={fare}
              onChangeText={setFare}
              keyboardType="numeric"
            />
            <Text style={styles.distanceText}>
              Distance: {totalDistanceRide} km
            </Text>
          </View>
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                Alert.alert(
                  "Confirm Cancel",
                  "Are you sure you want to cancel?",
                  [
                    {
                      text: "No",
                      style: "cancel",
                    },
                    {
                      text: "Yes",
                      onPress: () => navigation.goBack(),
                    },
                  ]
                );
              }}
            >
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                Alert.alert(
                  "Confirm Action",
                  "Do you want to proceed with the confirmation?",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "OK",
                      onPress: handleConfirm,
                    },
                  ]
                );
              }}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </ImageBackground>
    </ScrollView>
  );
  
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
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
  scrollViewContent: {
    flexGrow: 1,
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
    backgroundColor: "rgba(255,215,0,0.5)", // For the semi-transparent background
    borderColor: "rgba(255,255,255,0.25)",
    margin: 5,
    borderRadius: 10,
    alignItems: "center",
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  locationButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  locationButton: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  fareContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  fareLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  fareInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "50%",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#008000",
  },
  distanceText: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
  fareHint: {
    fontSize: 12,
    color: "#555",
    marginTop: 5,
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
  suggestionList: {
    maxHeight: 200,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginTop: -10,
    marginBottom: 10,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  flatList: {
    flex: 1,
    width: "100%",
  },
});

export default MotorTaxiOptionScreen;
