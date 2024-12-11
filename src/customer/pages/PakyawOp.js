import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
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
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as Location from "expo-location";
import { CustomerContext } from "../../context/customerContext";
import userService from "../../services/auth&services";
import { BlurView } from "expo-blur";
import { MAP_API_KEY } from "@env";
import { AuthContext } from "../../services/AuthContext";

const GOOGLE_PLACES_API_KEY = MAP_API_KEY;

const PlaceSuggestion = ({ suggestion, onPress }) => (
  <TouchableOpacity
    style={styles.suggestionItem}
    onPress={() => onPress(suggestion)}
  >
    <Text>{suggestion.description}</Text>
  </TouchableOpacity>
);

const NumberInput = ({ numberOfRiders, onIncrement, onDecrement }) => (
  <View style={styles.numberInputContainer}>
    <Text style={styles.fareLabel}>Number of Riders: </Text>
    <TouchableOpacity onPress={onDecrement} style={styles.numberButton}>
      <Text style={styles.numberButtonText}>-</Text>
    </TouchableOpacity>
    <Text style={styles.numberText}>{numberOfRiders}</Text>
    <TouchableOpacity onPress={onIncrement} style={styles.numberButton}>
      <Text style={styles.numberButtonText}>+</Text>
    </TouchableOpacity>
  </View>
);

const PakyawOptionScreen = ({ navigation, route }) => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [numberOfRiders, setNumberOfRiders] = useState(1);
  const [fare, setFare] = useState();
  const [userId, setUserId] = useState(null);
  const { customerCoords, setCustomerCoords } = useContext(CustomerContext);
  const [totalDistanceRide, setTotalDistanceRide] = useState(0);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const pickupTimeoutRef = useRef(null);
  const dropoffTimeoutRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculatingFare, setIsCalculatingFare] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isBackAndForth, setIsBackAndForth] = useState(false);
  const [returnDate, setReturnDate] = useState(new Date());
  const [showReturnDatePicker, setShowReturnDatePicker] = useState(false);
  const { baseFare, additionalFareRate } = useContext(AuthContext);


  useEffect(() => {
    if (baseFare) {
      setFare(Number(baseFare).toFixed(2));
    }
  }, [baseFare]);

  useEffect(() => {
    const fetchUserId = async () => {
      const response = await userService.getUserId();
      const id = parseInt(response, 10);
      setUserId(id);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (isClearing) return;
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
    navigation.navigate("MapPicker", { locationType, ride_type: "Book Pakyaw" });
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

  const calculateFare = (distance, backAndForth = isBackAndForth) => {
    // const baseFare = 40;
    // const additionalFareRate = 12;
    const thresholdKm = 2;
  
    let calculatedFare;
    if (distance <= thresholdKm) {
      calculatedFare = baseFare;
    } else {
      const exceedingDistance = distance - thresholdKm;
      calculatedFare = baseFare + exceedingDistance * additionalFareRate;
    }
  
    // Double the fare if back and forth is true
    if (backAndForth) {
      calculatedFare *= 1.5;
    }
  
    setFare(calculatedFare.toFixed(2));
  };
  

  const handleConfirm = async () => {
    if (isLoading) return;

    if (!pickupLocation || !dropoffLocation) {
      Alert.alert("Validation Error", "Please fill out all of the fields.");
      return;
    }

    setIsLoading(true);

    const currentDate = new Date();
    const formattedCurrentDate = currentDate
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

      const bookDetails = {
        user_id: userId,
        ride_date: formattedCurrentDate,
        ride_type: "Pakyaw",
        numberOfRiders: numberOfRiders,
        pickup_location: pickupAddress,
        dropoff_location: dropoffAddress,
        fare: parseFloat(fare),
        distance: totalDistanceRide,
        status: isScheduled ? "Scheduled" : "Available",
        scheduledDate,
        description,
        isBackAndForth,
        returnDate,
      };
  

    console.log("BOOOOK:", bookDetails)

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
      const response = await userService.pakyaw(bookDetails);
      console.log("Booked Successfully:", response.data);
      await userService.saveBookLocation(rideLocationDetails);
      navigation.navigate("Pakyaw");
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

  const clearPickupAddress = async () => {
    console.log("Clearing pickup address");
    setIsClearing(true);
    
    // Clear pickup fields
    setPickupLocation("");
    setPickupAddress("");
    setPickupSuggestions([]);
    
    // Reset fare if no dropoff location
    if (!dropoffLocation) {
      setFare("40.00");
      setTotalDistanceRide(0);
    }
    
    // Small delay before allowing new updates
    setTimeout(() => {
      setIsClearing(false);
    }, 100);
  };

  const clearDropoffAddress = async () => {
    console.log("Clearing dropoff address");
    setIsClearing(true);
    
    // Clear dropoff fields
    setDropoffLocation("");
    setDropoffAddress("");
    setDropoffSuggestions([]);
    
    // Reset fare if no pickup location
    if (!pickupLocation) {
      setFare("40.00");
      setTotalDistanceRide(0);
    }
    
    // Small delay before allowing new updates
    setTimeout(() => {
      setIsClearing(false);
    }, 100);
  };

  const showDatePicker1 = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: scheduledDate,
        mode: 'datetime',
        is24Hour: true,
        onChange: (event, selectedDate) => {
          if (event.type === 'set' && selectedDate) {
      setScheduledDate(selectedDate);
    }
        },
      });
    } else {
      setShowDatePicker(true);
    }
  };

  const showReturnDatePicker1 = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: returnDate,
        mode: 'datetime',
        is24Hour: true,
        minimumDate: scheduledDate, // Can't be before scheduled date
        onChange: (event, selectedDate) => {
          if (event.type === 'set' && selectedDate) {
            setReturnDate(selectedDate);
          }
        },
      });
    } else {
      setShowReturnDatePicker(true);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'ios') {
    setShowDatePicker(false);
      if (selectedDate) {
        setScheduledDate(selectedDate);
      }
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
      <ScrollView
        intensity={800}
        tint="light"
        style={styles.blurContainer}
        contentContainerStyle={styles.scrollViewContent} // Added this prop
      >
          <Text style={styles.title}>Pakyaw</Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
            <NumberInput 
              numberOfRiders={numberOfRiders}
              onIncrement={() => setNumberOfRiders(numberOfRiders + 1)}
              onDecrement={() => {
                if (numberOfRiders > 1) {
                  setNumberOfRiders(numberOfRiders - 1);
                }
              }}
            />
              <View style={styles.inputWithClear}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Pick me up from"
                  value={pickupAddress}
                  onChangeText={handlePickupInputChange}
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
                style={styles.locationButton}
                onPress={getCurrentLocation}
              >
                <Text style={styles.locationButtonText}>Use current location</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={() => chooseFromMap("pickup")}
              >
                <Text style={styles.locationButtonText}>Choose from map</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputWithClear}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Destination"
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
          </View>

            {/* Back and Forth Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Back and Forth</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isBackAndForth ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => {
                setIsBackAndForth((prevValue) => {
                  const newValue = !prevValue;
                  console.log("isBackAndForth toggled to:", newValue);

                  // Use the new value directly for fare calculation
                  if (totalDistanceRide > 0) {
                    calculateFare(totalDistanceRide, newValue);
                  }

                  return newValue;
                });
              }}
              value={isBackAndForth}
            />


          </View>

          {/* Scheduled Ride Toggle */}
          <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Scheduled Ride</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isScheduled ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => setIsScheduled(!isScheduled)}
                value={isScheduled}
              />
            </View>
            {/* Date Picker section */}
          {isScheduled && (
            <View style={styles.datePickerContainer}>
              <Text style={styles.dateLabel}>Departure Date & Time:</Text>
              <TouchableOpacity 
                onPress={showDatePicker1}
                style={styles.dateDisplayContainer}
              >
                <Text style={styles.dateDisplayText}>
                  {scheduledDate.toLocaleString()}
                </Text>
              </TouchableOpacity>

              {/* Return Date Picker (only show if back and forth is selected) */}
              {isBackAndForth && (
                <>
                  <Text style={[styles.dateLabel, { marginTop: 10 }]}>Return Date & Time:</Text>
                  <TouchableOpacity 
                    onPress={showReturnDatePicker1}
                    style={styles.dateDisplayContainer}
                  >
                    <Text style={styles.dateDisplayText}>
                      {returnDate.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {Platform.OS === 'ios' && showDatePicker && (
                <DateTimePicker
                  testID="scheduleDatePicker"
                  value={scheduledDate}
                  mode="datetime"
                  is24Hour={true}
                  display="default"
                  onChange={handleDateChange}
                />
              )}

              {Platform.OS === 'ios' && showReturnDatePicker && (
                <DateTimePicker
                  testID="returnDatePicker"
                  value={returnDate}
                  mode="datetime"
                  is24Hour={true}
                  display="default"
                  minimumDate={scheduledDate}
                  onChange={handleReturnDateChange}
                />
              )}
            </View>
          )}

          {/* Description Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.labels}>Description</Text>
            <TextInput
              style={[styles.input, styles.instructionsInput]}
              placeholder="Special instructions"
              value={description}
              onChangeText={setDescription}
              multiline={true}
            />
          </View>

          <View style={styles.fareContainer}>
            {isCalculatingFare ? (
              <ActivityIndicator size="large" color="black" />
            ) : (
              <>
                <Text style={styles.fareLabel}>
                  Estimated Fare {isBackAndForth ? '(Round Trip)' : ''}:
                </Text>
                <TextInput
                  style={styles.fareInput}
                  value={fare}
                  onChangeText={setFare}
                  keyboardType="numeric"
                  editable={false}
                />
                <Text style={styles.distanceText}>
                  Distance: {totalDistanceRide} km {isBackAndForth ? '(one way)' : ''}
                </Text>
              </>
            )}
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
              <Text style={[styles.cancelButtonText, isLoading && styles.disabledText]}>
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
                  <Text style={[styles.confirmButtonText, styles.loadingText]}>
                    Booking...
                  </Text>
                </View>
              ) : (
                <Text style={styles.confirmButtonText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView  >
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  blurContainer: {
    flex: 1,
    backgroundColor: "rgba(255,215,0,0.5)",
    margin: 5,
    borderRadius: 10,
  },
  scrollViewContent: {  // New style for ScrollView content
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
  inputWrapper: {
    marginBottom: 10,
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
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  inputWithClear: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
  },
  clearButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  numberButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
  },
  numberButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  numberText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  datePickerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  dateDisplayContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  dateDisplayText: {
    textAlign: 'center',
    fontSize: 16,
  },
  instructionsInput: {
    height: 80, // To give more space for instructions input
    textAlignVertical: "top", // To start text from top
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

export default PakyawOptionScreen;