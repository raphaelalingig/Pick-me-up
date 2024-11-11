import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  Pressable,
  Animated
} from "react-native";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import userService from "../../services/auth&services";
import riderMarker from "../../../assets/rider.png";
import customerMarker from "../../../assets/customer.png";

const TrackingCustomer = ({ route, navigation }) => {
  const { ride } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [riderLocation, setRiderLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [totalFare, setTotalFare] = useState(0);
  const [mapRegion, setMapRegion] = useState(null);
  const [totalDistanceRide, setTotalDistanceRide] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [pressProgress] = useState(new Animated.Value(0));
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    let locationSubscription;

    const setupLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission to access location was denied");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setRiderLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // Set customer location from ride data
        if (ride.ridelocations) {
          setCustomerLocation({
            latitude: parseFloat(ride.ridelocations.customer_latitude),
            longitude: parseFloat(ride.ridelocations.customer_longitude),
          });
        }

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10, // Update every 10 meters
          },
          (newLocation) => {
            setRiderLocation({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            });
            console.log(newLocation.coords.latitude, newLocation.coords.longitude)
            const rider_lat = newLocation.coords.latitude;
            const rider_long = newLocation.coords.longitude;
            uploadRiderLocation(rider_lat, rider_long)
          }
        );
      } catch (error) {
        console.error("Error setting up location:", error);
      } finally {
        setIsLoading(false);
      }
    };

    setupLocation();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [ride]);

  const uploadRiderLocation = async (rider_lat, rider_long) => {
    console.log("COORDS",rider_lat, rider_long)
    try {
      const response = await userService.updateRiderLocation(rider_lat, rider_long);
      console.log("Updated Succesfully:", response)
    } catch (error) {
      console.error("Error uploading rider location:", error);
    }
  };

  useEffect(() => {
    if (riderLocation && customerLocation) {
      fetchDirections();
      calculateMapRegion();
    }
  }, [riderLocation, customerLocation]);

  useEffect(() => {
    if (totalDistanceRide) {
      calculateFare(totalDistanceRide);
    }
  }, [totalDistanceRide]);

  const calculateMapRegion = () => {
    if (!riderLocation || !customerLocation) return;

    const minLat = Math.min(riderLocation.latitude, customerLocation.latitude);
    const maxLat = Math.max(riderLocation.latitude, customerLocation.latitude);
    const minLng = Math.min(
      riderLocation.longitude,
      customerLocation.longitude
    );
    const maxLng = Math.max(
      riderLocation.longitude,
      customerLocation.longitude
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
      const origin = `${riderLocation.latitude},${riderLocation.longitude}`;
      const destination = `${customerLocation.latitude},${customerLocation.longitude}`;
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
        setTotalDistanceRide(totalDistanceKm);
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  };

  const calculateFare = (distance) => {
    const baseFare = 40;
    const additionalFareRate = 10;
    const thresholdKm = 2;

    let fare;
    if (distance <= thresholdKm) {
      fare = baseFare;
    } else {
      const exceedingDistance = distance - thresholdKm;
      fare = baseFare + exceedingDistance * additionalFareRate;
    }

    setTotalFare(fare.toFixed(2));
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

  const startRide = async () => {
    setIsLoading(true);
    try {
      const response = await userService.start_ride(ride.ride_id);
      if (response.data && response.data.message) {
        Alert.alert("Success", response.data.message);
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", "Failed to start the ride. Please try again.");
      }
    } catch (error) {
      console.error(
        "Failed to start ride",
        error.response ? error.response.data : error.message
      );
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      "Cancel Ride",
      "Are you sure you want to cancel this ride?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              const response = await userService.cancel_ride(ride.ride_id);
              if (response.data && response.data.message) {
                Alert.alert("Success", response.data.message);
                navigation.navigate("Home");
              } else {
                Alert.alert("Error", "Failed to cancel the ride. Please try again.");
              }
            } catch (error) {
              console.error(
                "Failed to Cancel Ride",
                error.response ? error.response.data : error.message
              );
              Alert.alert("Error", "An error occurred. Please try again.");
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleContactPress = () => {
    if (ride && ride.user && ride.user.mobile_number) {
      const phoneNumber = `tel:${ride.user.mobile_number}`;
      Linking.openURL(phoneNumber).catch((err) =>
        Alert.alert("Error", "Failed to open the dialer.")
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleStartPress = () => {
    setShowStartModal(true);
  };

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(pressProgress, {
      toValue: 1,
      duration: 2000, // 2 seconds for long press
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && isPressed) {
        startRide();
        setShowStartModal(false);
      }
    });
  };

  const handlePressOut = () => {
    setIsPressed(false);
    pressProgress.setValue(0);
  };

  const StartRideModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showStartModal}
      onRequestClose={() => setShowStartModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Start Ride</Text>
          <Text style={styles.modalText}>Press and hold to start the ride</Text>
          
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
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
              <Text style={styles.longPressButtonText}>Hold to Start</Text>
            </View>
          </Pressable>

          <TouchableOpacity
            style={styles.cancelModalButton}
            onPress={() => setShowStartModal(false)}
          >
            <Text style={styles.cancelModalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );


  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          onMapReady={calculateMapRegion}
          provider={PROVIDER_GOOGLE}
        >
          {riderLocation && (
            <Marker coordinate={riderLocation} title="Rider Location">
              <Image source={riderMarker} style={styles.riderIconStyle} />
            </Marker>
          )}
          <Marker
            coordinate={customerLocation}
            title="Customer Location"
            pinColor="blue"
          >
            <Image source={customerMarker} style={styles.customerIconStyle} />
          </Marker>
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#FF0000"
            strokeWidth={3}
          />
        </MapView>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.header}>
          <FontAwesome5 name="users" size={24} color="black" />
          <Text style={styles.serviceTitle}>{ride.ride_type}</Text>
        </View>

        <View style={styles.customerDetails}>
          <Text style={styles.subTitle}>Customer Details</Text>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="account" size={24} color="black" />
            <Text style={styles.detailText}>
              {ride.user
                ? `${ride.user.first_name} ${ride.user.last_name}`
                : "N/A"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="phone" size={24} color="black" />
            <Text style={styles.detailText}>
              {ride.user ? ride.user.mobile_number : "N/A"}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleContactPress}>
          <Text style={styles.buttonText}>Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleStartPress}>
          <Text style={styles.buttonText}>Start Ride</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <StartRideModal />
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
  detailsContainer: {
    flex: 2,
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  serviceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
  },
  customerDetails: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    backgroundColor: "#28a745",
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  riderIconStyle: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  customerIconStyle: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  longPressButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#28a745',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#1a752f',
  },
  longPressButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    zIndex: 1,
  },
  cancelModalButton: {
    padding: 10,
  },
  cancelModalButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default TrackingCustomer;
