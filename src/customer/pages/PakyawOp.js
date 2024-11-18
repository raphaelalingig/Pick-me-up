import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { CustomerContext } from "../../context/customerContext";
import userService from "../../services/auth&services";
import { BlurView } from "expo-blur";
import { Picker } from "@react-native-picker/picker";

const GOOGLE_PLACES_API_KEY = "AIzaSyAekXSq_b4GaHneUKEBVsl4UTGlaskobFo";

const PlaceSuggestion = ({ suggestion, onPress }) => (
  <TouchableOpacity
    style={styles.suggestionItem}
    onPress={() => onPress(suggestion)}
  >
    <Text>{suggestion.description}</Text>
  </TouchableOpacity>
);

const PakyawOptionScreen = ({ navigation, route }) => {
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
  const [isLoading, setIsLoading] = useState(false);

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

    const newPickupLocation = `${customerCoords.latitude}, ${customerCoords.longitude}`;
    setPickupLocation(newPickupLocation);

    try {
      const result = await Location.reverseGeocodeAsync({
        latitude: customerCoords.latitude,
        longitude: customerCoords.longitude,
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
      const [pickupLat, pickupLng] = pickup.split(",");
      const [dropoffLat, dropoffLng] = dropoff.split(",");
      const origin = `${pickupLat},${pickupLng}`;
      const destination = `${dropoffLat},${dropoffLng}`;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_PLACES_API_KEY}`;

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
    if (isLoading) return;

    setIsLoading(true);

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
      distance: totalDistanceRide,
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
      const response = await userService.book_pakyaw(bookDetails);
      console.log("Booked Successfully:", response.data);
      await userService.saveBookLocation(rideLocationDetails);
      navigation.navigate("WaitingForRider", { bookDetails });
    } catch (error) {
      console.error("Failed to add ride history or save ride location:", error);
      Alert.alert("Booking Failed", "Please try again later.");
    } finally {
      setIsLoading(false);
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
      if (data.result && data.result.geometry && data.result.geometry.location) {
        const { lat, lng } = data.result.geometry.location;
        const location = `${lat}, ${lng}`;
        
        // Store the new location value
        let newPickupLocation = pickupLocation;
        let newDropoffLocation = dropoffLocation;
        
        if (locationType === "pickup") {
          newPickupLocation = location;
          setPickupLocation(location);
          setPickupAddress(suggestion.description);
          setPickupSuggestions([]);
        } else {
          newDropoffLocation = location;
          setDropoffLocation(location);
          setDropoffAddress(suggestion.description);
          setDropoffSuggestions([]);
        }
  
        // Use the new values directly instead of depending on state
        if (newPickupLocation && newDropoffLocation) {
          await fetchDirectionsAndUpdateFare(newPickupLocation, newDropoffLocation);
        }
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  const clearPickupAddress = () => {
    setPickupLocation("");
    setPickupAddress("");
    setPickupSuggestions([]);
    if (dropoffLocation) {
      setFare("40.00");
      setTotalDistanceRide(0);
    }
  };

  const clearDropoffAddress = () => {
    setDropoffLocation("");
    setDropoffAddress("");
    setDropoffSuggestions([]);
    if (pickupLocation) {
      setFare("40.00");
      setTotalDistanceRide(0);
    }
  };

  return (
    <ImageBackground
      source={require("../../pictures/3.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Pakyaw</Text>
        <TextInput
          style={styles.input}
          placeholder="How many riders"
          keyboardType="numeric"
          // Add onChangeText functionality
        />
        <TextInput
          style={styles.input}
          placeholder="Pick up destination"
          // Add onChangeText functionality
        />
        <TextInput
          style={styles.input}
          placeholder="Offer Amount"
          keyboardType="numeric"
          // Add onChangeText functionality
        />
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.cancelButton}>
            <Text
              style={styles.cancelButtonText}
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
              );}}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm} // Change to use the new function
          >
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
  note: {
    fontSize: 12,
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
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

export default PakyawOptionScreen;
