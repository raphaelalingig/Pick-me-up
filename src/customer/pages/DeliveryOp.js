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
  Switch,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
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

const DeliveryOptionScreen = ({ navigation, route }) => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [fare, setFare] = useState("40.00");
  const [userId, setUserId] = useState(null);
  const [deliveryType, setDeliveryType] = useState("");
  const [instructions, setInstructions] = useState("");
  const { customerCoords, setCustomerCoords } = useContext(CustomerContext);
  const [totalDistanceRide, setTotalDistanceRide] = useState(0);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const pickupTimeoutRef = useRef(null);
  const dropoffTimeoutRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculatingFare, setIsCalculatingFare] = useState(false);
  const [isRiderDecide, setIsRiderDecide] = useState(false);



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
    navigation.navigate("MapPicker", { locationType, ride_type: "Delivery" });
  };

  const toggleRiderDecide = () => {
    setIsRiderDecide(!isRiderDecide);
    
    // Reset location if turning on rider decide
    if (!isRiderDecide) {
      setPickupLocation("");
      setPickupAddress("");
      setPickupSuggestions([]);
    }
  };


  const fetchDirectionsAndUpdateFare = async (
    pickup = pickupLocation,
    dropoff = dropoffLocation
  ) => {
    if (!pickup || !dropoff) {
      console.log("Pickup or dropoff location is missing");
      return;
    }

    setIsCalculatingFare(true); // Start fare calculation
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
    } finally {
      setIsCalculatingFare(false); // End fare calculation
    }
  };

  const calculateFare = (distance) => {
    const baseFare = 40;
    const additionalFareRate = 12;
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
    if (!pickupLocation || !dropoffLocation) {
      Alert.alert("Validation Error", "Please fill out both pickup and dropoff fields.");
      return;
    }

    if (isCalculatingFare) return; // Prevent confirmation during fare calculation

    setIsLoading(true);

    const currentDate = new Date();
    const formattedCurrentDate = currentDate
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const bookDetails = {
      user_id: userId,
      ride_date: formattedCurrentDate,
      ride_type: "Delivery",
      delivery_type: deliveryType,
      pickup_location: pickupAddress,
      dropoff_location: dropoffAddress,
      fare: parseFloat(fare),
      distance: totalDistanceRide,
      status: "Available",
      instructions: instructions,
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
      const response = await userService.deliver(bookDetails);
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
      if (
        data.result &&
        data.result.geometry &&
        data.result.geometry.location
      ) {
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
          await fetchDirectionsAndUpdateFare(
            newPickupLocation,
            newDropoffLocation
          );
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ImageBackground
        source={require("../../pictures/3.png")}
        style={styles.background}
      >
        <BlurView intensity={800} tint="light" style={styles.blurContainer}>
          <Text style={styles.title}>Delivery</Text>

          {/* Delivery Type Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Delivery Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={deliveryType}
                onValueChange={(itemValue) => {
                  console.log("Selected:", itemValue);
                  setDeliveryType(itemValue);
                  setIsRiderDecide(false);
                }}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Select Type" value="" />
                <Picker.Item label="Padala" value="Padala" />
                <Picker.Item label="Pasugo" value="Pasugo" />
              </Picker>
            </View>
          </View>

          {/* Rider Decide Toggle for Pasugo */}
          {deliveryType === "Pasugo" && (
            <View style={styles.riderDecideContainer}>
              <Text style={styles.riderDecideLabel}>Let Rider Decide</Text>
              <Switch
                value={isRiderDecide}
                onValueChange={toggleRiderDecide}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isRiderDecide ? "#f5dd4b" : "#f4f3f4"}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputWithClear}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Item pick up location"
                  value={pickupAddress}
                  onChangeText={handlePickupInputChange}
                  editable={!(deliveryType === "Pasugo" && isRiderDecide)}
                />
                {pickupAddress !== "" && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearPickupAddress}
                  >
                    <Text style={styles.clearButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
              {pickupSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {pickupSuggestions.map((item) => (
                    <PlaceSuggestion
                      key={item.place_id}
                      suggestion={item}
                      onPress={(suggestion) =>
                        handleSuggestionPress(suggestion, "pickup")
                      }
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.locationButtonsContainer}>
              <TouchableOpacity
                  style={[
                    styles.locationButton,
                    (deliveryType === "Pasugo" && isRiderDecide) && styles.disabledButton
                  ]}
                  onPress={getCurrentLocation}
                  disabled={deliveryType === "Pasugo" && isRiderDecide}
                >
                <Text 
                  style={[
                    styles.locationButtonText,
                    (deliveryType === "Pasugo" && isRiderDecide) && styles.disabledText
                  ]}
                >
                  {deliveryType === "Pasugo" 
                    ? (isRiderDecide ? "Disabled" : "Use current location") 
                    : "Use current location"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.locationButton,
                  (deliveryType === "Pasugo" && isRiderDecide) && styles.disabledButton
                ]}
                onPress={() => chooseFromMap("pickup")}
                disabled={deliveryType === "Pasugo" && isRiderDecide}
              >
                <Text 
                  style={[
                    styles.locationButtonText,
                    (deliveryType === "Pasugo" && isRiderDecide) && styles.disabledText
                  ]}
                >
                  {deliveryType === "Pasugo" 
                    ? (isRiderDecide ? "Disabled" : "Choose from map") 
                    : "Choose from map"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <View style={styles.inputWithClear}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Drop off Location"
                  value={dropoffAddress}
                  onChangeText={handleDropoffInputChange}
                />
                {dropoffAddress !== "" && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearDropoffAddress}
                  >
                    <Text style={styles.clearButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
              {dropoffSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {dropoffSuggestions.map((item) => (
                    <PlaceSuggestion
                      key={item.place_id}
                      suggestion={item}
                      onPress={(suggestion) =>
                        handleSuggestionPress(suggestion, "dropoff")
                      }
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.locationButtonsContainer}>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={() => chooseFromMap("dropoff")}
              >
                <Text style={styles.locationButtonText}>Choose from map</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Text variant="bodyLarge" style={styles.labels}>
                Instructions
              </Text>
              <TextInput
                style={[styles.input, styles.instructionsInput]}
                placeholder="Special instructions"
                value={instructions}
                onChangeText={setInstructions} // Bind the instructions input
              />
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
                if (!isLoading) {
                  Alert.alert(
                    "Confirm Cancel",
                    "Are you sure you want to cancel?",
                    [
                      { text: "No", style: "cancel" },
                      { text: "Yes", onPress: () => navigation.goBack() },
                    ]
                  );
                }
              }}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  isLoading && styles.disabledText,
                ]}
              >
                CANCEL
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, isLoading && styles.disabledButton]}
              onPress={() => {
                if (!isLoading) {
                  Alert.alert(
                    "Confirm Action",
                    "Do you want to proceed with the confirmation?",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "OK", onPress: handleConfirm },
                    ]
                  );
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  {/* <Text style={[styles.confirmButtonText, styles.loadingText]}>
                    Processing...
                  </Text> */}
                </View>
              ) : (
                <Text style={styles.confirmButtonText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </BlurView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    width: "100%",
  },
  blurContainer: {
    flex: 1,
    backgroundColor: "rgba(255,215,0,0.5)",
    borderRadius: 5,
    alignItems: "center",
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  labels: {
    fontSize: 16,
    color: "#fff",
    marginVertical: 10,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 5,
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
    marginBottom: 10,
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
  inputWithClear: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 10,
  },
  clearButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 20,
    color: "#999",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  pickerContainer: {
    width: "100%", // Make it take most of the width
    alignSelf: "center",
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    marginBottom: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden", // Ensures the border radius is applied
  },
  picker: {
    width: "100%",
    backgroundColor: "#fff",
  },
  pickerItem: {
    fontSize: 16, // Adjust the font size if needed
  },
  labels: {
    marginBottom: 5,
    fontWeight: "bold",
  },
  instructionsInput: {
    height: 80, // To give more space for instructions input
    textAlignVertical: "top", // To start text from top
  },
  riderDecideContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  riderDecideLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  disabledText: {
    color: '#666666',
  },
});

export default DeliveryOptionScreen;