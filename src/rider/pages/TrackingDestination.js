import React, { useState, useEffect, useContext, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  Image,
  Modal,
  Pressable,
  Animated,
} from "react-native";
import { Text } from "react-native-paper";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import userService from "../../services/auth&services";
import { RiderContext } from "../../context/riderContext";

import riderWithUser from "../../../assets/riderWithCustomer.png";
import flagDestination from "../../../assets/flagDestination.png";

const TrackingDestination = ({ route, navigation }) => {
  const { ride } = route.params;
  const { setTotalDistanceRide } = useContext(RiderContext);
  const [isLoading, setIsLoading] = useState(false);
  const [customerLocation, setCustomerLocation] = useState({
    latitude: parseFloat(ride.ridelocations.customer_latitude),
    longitude: parseFloat(ride.ridelocations.customer_longitude),
  });
  const [destinationLocation, setDestinationLocation] = useState({
    latitude: parseFloat(ride.ridelocations.dropoff_latitude),
    longitude: parseFloat(ride.ridelocations.dropoff_longitude),
  });
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [totalFare, setTotalFare] = useState(parseFloat(ride.fare));
  const [mapRegion, setMapRegion] = useState(null);
  const [totalDistanceRide, setLocalTotalDistanceRide] = useState(0);
  const [showArriveModal, setShowArriveModal] = useState(false);
  const [pressProgress] = useState(new Animated.Value(0));
  const [isPressed, setIsPressed] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);
  
  const pressAnimationRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required for this feature."
        );
        return;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 5000,
        },
        (location) => {
          setCustomerLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );

      setLocationSubscription(subscription);
      fetchDirections();
      calculateMapRegion();

      return () => {
        if (locationSubscription) {
          locationSubscription.remove();
        }
      };
    })();
  }, []);

  useEffect(() => {
    fetchDirections();
    calculateMapRegion();
  }, [customerLocation, destinationLocation]);

  useEffect(() => {
    if (totalDistanceRide) {
      setTotalDistanceRide(totalDistanceRide);
    }
  }, [totalDistanceRide]);

  const calculateMapRegion = () => {
    const minLat = Math.min(
      customerLocation.latitude,
      destinationLocation.latitude
    );
    const maxLat = Math.max(
      customerLocation.latitude,
      destinationLocation.latitude
    );
    const minLng = Math.min(
      customerLocation.longitude,
      destinationLocation.longitude
    );
    const maxLng = Math.max(
      customerLocation.longitude,
      destinationLocation.longitude
    );

    const latDelta = (maxLat - minLat) * 1.5;
    const lngDelta = (maxLng - minLng) * 1.5;

    setMapRegion({
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.02),
      longitudeDelta: Math.max(lngDelta, 0.02),
    });
  };

  const fetchDirections = async () => {
    try {
      const apiKey = "AIzaSyAekXSq_b4GaHneUKEBVsl4UTGlaskobFo";
      const origin = `${customerLocation.latitude},${customerLocation.longitude}`;
      const destination = `${destinationLocation.latitude},${destinationLocation.longitude}`;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.routes.length) {
        const points = result.routes[0].overview_polyline.points;
        const decodedPoints = decodePolyline(points);
        setRouteCoordinates(decodedPoints);

        const totalDistanceMeters = result.routes[0].legs.reduce(
          (sum, leg) => sum + leg.distance.value,
          0
        );
        const totalDistanceKm = (totalDistanceMeters / 1000).toFixed(2);
        setLocalTotalDistanceRide(totalDistanceKm);
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        console.log("Location fetched successfully:", location);

        // Update rider status and location
        await userService.updateRiderStatusAndLocation({
          longitude: location.coords.longitude,
          latitude: location.coords.latitude,
          status: "Online",
        });
        console.log("Location updated successfully in the database");
      } else {
        console.error("Location permission not granted");
        setError("Location permission is required to proceed.");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      setError("An error occurred while fetching location.");
    }
  };

  const completeRide = async () => {
    setIsLoading(true);
    try {
      const response = await userService.complete_ride(ride.ride_id);
      if (response.data && response.data.message) {
        await getCurrentLocation();
        Alert.alert("Success", response.data.message);
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", "Failed to finish the ride. Please try again.");
      }
    } catch (error) {
      console.error(
        "Failed to finish ride",
        error.response ? error.response.data : error.message
      );
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const decodePolyline = (encoded) => {
    const poly = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      const point = {
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      };
      poly.push(point);
    }
    return poly;
  };

  const handleArrivePress = () => {
    setShowArriveModal(true);
  };

  const handlePressIn = () => {
    setIsPressed(true);
    // Cancel any existing animation
    if (pressAnimationRef.current) {
      pressAnimationRef.current.stop();
    }

    // Store animation reference
    pressAnimationRef.current = Animated.timing(pressProgress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    });

    pressAnimationRef.current.start(({ finished }) => {
      if (finished && isPressed) {
        completeRide();
        setShowArriveModal(false);
      }
    });
  };

  const handlePressOut = () => {
    setIsPressed(false);
    // Cancel animation on press out
    if (pressAnimationRef.current) {
      pressAnimationRef.current.stop();
    }
    pressProgress.setValue(0);
  };

  const FinishRideModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showArriveModal}
      onRequestClose={() => setShowArriveModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Finish Ride</Text>
          <Text style={styles.modalText}>
            Press and hold to finish the ride
          </Text>

          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.longPressButton}
          >
            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: pressProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
              <Text style={styles.longPressButtonText}>Hold to Confirm</Text>
            </View>
          </Pressable>

          <TouchableOpacity
            style={styles.cancelModalButton}
            onPress={() => setShowArriveModal(false)}
          >
            <Text style={styles.cancelModalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (isLoading || !ride) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          onMapReady={calculateMapRegion}
          provider={PROVIDER_GOOGLE}
        >
          <Marker coordinate={customerLocation} title="Customer Location">
            <Image
              source={riderWithUser}
              style={styles.riderWithUserIconStyle}
            />
          </Marker>
          <Marker
            coordinate={destinationLocation}
            title="Destination"
            pinColor="green"
          >
            <Image
              source={flagDestination}
              style={styles.flagDestinationIconStyle}
            />
          </Marker>
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#FF0000"
            strokeWidth={3}
          />
        </MapView>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.headerText}>Tracking Destination</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Distance: {totalDistanceRide} km</Text>
          <Text style={styles.infoText}>Fare: ₱{totalFare}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Submit Report")}
          >
            <Text style={styles.buttonText}>Report</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.arrivedButton]}
            onPress={handleArrivePress}
          >
            <Text style={styles.buttonText}>Arrived</Text>
          </TouchableOpacity>
        </View>
        <FinishRideModal />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 3,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#FFC533",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    backgroundColor: "#b22222",
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  arrivedButton: {
    backgroundColor: "#228b22",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    justifyContent: "center",
    backgroundColor: "white",
    padding: 5,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  flagDestinationIconStyle: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  riderWithUserIconStyle: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  longPressButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#28a745",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
  },
  progressContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#1a752f",
  },
  longPressButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    zIndex: 1,
  },
  cancelModalButton: {
    padding: 10,
  },
  cancelModalButtonText: {
    color: "#dc3545",
    fontSize: 16,
  },
});

export default TrackingDestination;
