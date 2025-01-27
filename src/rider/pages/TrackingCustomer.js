import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  Image,
  Linking,
  Pressable,
  Animated,
} from "react-native";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import userService from "../../services/auth&services";
import riderMarker from "../../../assets/rider.png";
import customerMarker from "../../../assets/customer.png";
import deliveryMarker from "../../../assets/delivery.png";
import { MAP_API_KEY } from "@env";


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

  const pressAnimationRef = useRef(null);
  const hasCompletedRef = useRef(false);
  const locationSubscriptionRef = useRef(null);

  useEffect(() => {
    return () => {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (pressAnimationRef.current) {
        pressAnimationRef.current.stop();
      }
    };
  }, []);

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
            console.log(
              newLocation.coords.latitude,
              newLocation.coords.longitude
            );
            const rider_lat = newLocation.coords.latitude;
            const rider_long = newLocation.coords.longitude;
            uploadRiderLocation(rider_lat, rider_long);
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
      const apiKey = MAP_API_KEY;
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

  const calculateFare = (distance) => {
    const baseFare = 40;
    const additionalFareRate = 12;
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
    Alert.alert("Cancel Ride", "Are you sure you want to cancel this ride?", [
      {
        text: "No",
        style: "cancel",
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
              Alert.alert(
                "Cancelled",
                response.data.message,
                [
                  {
                    text: "Report",
                    onPress: () => navigation.navigate("Rider Feedback", {ride: ride, role: "Rider"}), 
                    style: "destructive",
                  },
                  {
                    text: "Home",
                    onPress: () => navigation.navigate("Home"),
                    style: "cancel",
                  },
                ]
              );
            } else {
              Alert.alert(
                "Error",
                "Failed to cancel the ride. Please try again."
              );
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
        },
      },
    ]);
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

  const handlePressIn = () => {
    hasCompletedRef.current = false;
    setIsPressed(true);

    if (pressAnimationRef.current) {
      pressAnimationRef.current.stop();
    }

    pressAnimationRef.current = Animated.timing(pressProgress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    });

    pressAnimationRef.current.start(({ finished }) => {
      if (finished && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        Alert.alert(
          "Start Ride",
          "Are you sure you want to start this ride?",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {
                setIsPressed(false);
                pressProgress.setValue(0);
              },
            },
            {
              text: "Yes",
              onPress: startRide,
            },
          ]
        );
      }
    });
  };

  const handlePressOut = () => {
    // Only reset if the animation hasn't completed
    if (!hasCompletedRef.current) {
      setIsPressed(false);
      if (pressAnimationRef.current) {
        pressAnimationRef.current.stop();
      }
      pressProgress.setValue(0);
    }
  };

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
            <Image 
              source={ride.ride_type === "Delivery" ? deliveryMarker : customerMarker} 
              style={styles.customerIconStyle} />
          </Marker>
          {/* // Orange (#FFA500)
              // Teal (#008080)
              // Light Blue (#1E90FF)
              // Goldenrod (#DAA520)
              // FF0000 */}
              <>
              {/* Outer Polyline (Border) */}
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#000000" // Border color (black)
                strokeWidth={4}       // Slightly thicker
              />

              {/* Inner Polyline (Main Color - Orange) */}
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#FFA500" // Main color (orange)
                strokeWidth={3}       // Slightly thinner
              />
            </>
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
          
          <View style={styles.startButtonContainer}>
            <Text style={styles.hintText}>Long press to start ride</Text>
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
                <Text style={styles.buttonText}>Start Ride</Text>
              </View>
            </Pressable>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
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
  startButtonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  
  hintText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  
  longPressButton: {
    backgroundColor: "#28a745",
    height: 40,
    borderRadius: 5,
    overflow: "hidden",
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

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'flex-end',
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default TrackingCustomer;
