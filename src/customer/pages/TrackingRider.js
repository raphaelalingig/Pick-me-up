import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  Linking,
  Image,
} from "react-native";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import userService from "../../services/auth&services";
import riderMarker from "../../../assets/rider.png";
import customerMarker from "../../../assets/customer.png";
import deliveryMarker from "../../../assets/delivery.png";
import usePusher from "../../services/pusher";
import { MAP_API_KEY } from "@env";


const TrackingRider = ({ navigation }) => {
  const [bookDetails, setBookDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [riderLocation, setRiderLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [mapRegion, setMapRegion] = useState(null);
  const [totalDistanceRide, setTotalDistanceRide] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [riderId, setRiderId] = useState(null);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [userId, setUserId] = useState(null);
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

  const validateCoordinates = (lat, lng) => {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    return !isNaN(parsedLat) &&
      !isNaN(parsedLng) &&
      parsedLat >= -90 &&
      parsedLat <= 90 &&
      parsedLng >= -180 &&
      parsedLng <= 180
      ? { latitude: parsedLat, longitude: parsedLng }
      : null;
  };

  useEffect(() => {
    const setupPusher = async () => {
      try {
        console.log("IDDDDD:",userId)
        if (!userId) return;
        const progressChannel = pusher.subscribe('progress');

        progressChannel.bind('RIDE_PROG', data => {
          console.log("Progress DATA received:", data);
          console.log("id & status:", data.update.id, data.update.status)
            if (data.update.id === userId) {
              if(data.update.status === "Start"){
                Alert.alert("Starting Ride", 'Your Rider Has Arrived!');
                navigation.navigate("Home");
            } else if (data.update.status === "Cancel") {
              Alert.alert(
                "Sorry",
                "This Ride has been cancelled.",
                [
                  {
                    text: "Home",
                    onPress: () => navigation.navigate("Home"),
                    style: "cancel",
                  },
                ]
              );
              }
            }
        });
        return () => {
          progressChannel.unbind_all();
          pusher.unsubscribe('progress');
        };
      } catch (error) {
        console.error('Error setting up Pusher:', error);
      }
    };
    setupPusher();
  }, [userId]);

  const fetchLatestAvailableRide = useCallback(async () => {
    try {
      setRefreshing(true);
      const ride = await userService.checkActiveBook();

      if (!ride?.rideDetails) {
        throw new Error("No active ride found");
      }

      setRiderId(ride.rideDetails.rider_id);
      setBookDetails(ride.rideDetails);

      // Validate and set customer location
      const customerCoords = validateCoordinates(
        ride.rideDetails.customer_latitude,
        ride.rideDetails.customer_longitude
      );

      if (!customerCoords) {
        throw new Error("Invalid customer coordinates");
      }
      setCustomerLocation(customerCoords);

      // Fetch and validate rider location
      const rider = await userService.fetchRiderLoc(ride.rideDetails.rider_id);
      console.log(rider);
      const riderCoords = validateCoordinates(
        rider.rider_latitude,
        rider.rider_longitude
      );

      if (riderCoords) {
        setRiderLocation(riderCoords);
      }

      // Only calculate map region and fetch directions if both locations are valid
      if (riderCoords) {
        calculateMapRegion(riderCoords, customerCoords);
        fetchDirections(riderCoords, customerCoords);
      } else {
        // If no rider coordinates, center map on customer
        setMapRegion({
          ...customerCoords,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    } catch (error) {
      console.error("Fetch ride error:", error);
      Alert.alert(
        "Error",
        "Unable to retrieve ride details. Please try again later.",
        [{ text: "OK", onPress: () => navigation.navigate("Home") }]
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      setInitialFetchDone(true);
    }
  }, []);

  const riderRefresh = useCallback(async () => {
    if (!riderId || !customerLocation) return;

    try {
      const rider = await userService.fetchRiderLoc(riderId);
      const riderCoords = validateCoordinates(
        rider.rider_latitude,
        rider.rider_longitude
      );

      if (riderCoords) {
        setRiderLocation(riderCoords);
        calculateMapRegion(riderCoords, customerLocation);
        fetchDirections(riderCoords, customerLocation);
      }
    } catch (error) {
      console.error("Rider refresh error:", error);
    }
  }, [riderId, customerLocation]);

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

  useEffect(() => {
    fetchLatestAvailableRide();
  }, [fetchLatestAvailableRide]);

  useEffect(() => {
    if (initialFetchDone && riderId) {
      const intervalId = setInterval(riderRefresh, 10000);
      return () => clearInterval(intervalId);
    }
  }, [riderRefresh, initialFetchDone, riderId]);

  const calculateMapRegion = (riderLoc, customerLoc) => {
    if (!riderLoc || !customerLoc) return;

    const minLat = Math.min(customerLoc.latitude, riderLoc.latitude);
    const maxLat = Math.max(customerLoc.latitude, riderLoc.latitude);
    const minLng = Math.min(customerLoc.longitude, riderLoc.longitude);
    const maxLng = Math.max(customerLoc.longitude, riderLoc.longitude);

    const latDelta = (maxLat - minLat) * 1.5;
    const lngDelta = (maxLng - minLng) * 1.5;

    setMapRegion({
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.02),
      longitudeDelta: Math.max(lngDelta, 0.02),
    });
  };

  const fetchDirections = async (riderLoc, customerLoc) => {
    if (!riderLoc || !customerLoc) return;

    try {
      const apiKey = MAP_API_KEY;
      const origin = `${riderLoc.latitude},${riderLoc.longitude}`;
      const destination = `${customerLoc.latitude},${customerLoc.longitude}`;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.routes?.[0]) {
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
      console.error("Directions error:", error);
    }
  };

  const handleContactPress = () => {
    if (bookDetails?.rider?.mobile_number) {
      const phoneNumber = `tel:${bookDetails.rider.mobile_number}`;
      Linking.openURL(phoneNumber).catch((err) =>
        Alert.alert("Error", "Failed to open the dialer.")
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading ride details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome5 name="users" size={24} color="black" />
        {bookDetails?.ride_type && (
          <Text style={styles.serviceTitle}>{bookDetails.ride_type}</Text>
        )}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchLatestAvailableRide}
          disabled={refreshing}
        >
          <MaterialCommunityIcons
            name={refreshing ? "loading" : "refresh"}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        {mapRegion && (
          <MapView
            style={styles.map}
            region={mapRegion}
            provider={PROVIDER_GOOGLE}
          >
            {riderLocation && (
              <Marker coordinate={riderLocation} title="Rider Location">
                <Image source={riderMarker} style={styles.riderIconStyle} />
              </Marker>
            )}
            {customerLocation && (
              <Marker coordinate={customerLocation} title="Customer Location">
                <Image
                  source={bookDetails.ride_type === "Delivery" ? deliveryMarker : customerMarker} 
                  style={styles.customerIconStyle}
                />
              </Marker>
            )}
            {routeCoordinates.length > 0 && (
              // Orange (#FFA500)
              // Teal (#008080)
              // Light Blue (#1E90FF)
              // Goldenrod (#DAA520)
              // FF0000
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
            )}
          </MapView>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.customerDetails}>
          <Text style={styles.subTitle}>Rider Details</Text>
          {bookDetails?.rider && (
            <>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="account"
                  size={24}
                  color="black"
                />
                <Text style={styles.detailText}>
                  {`${bookDetails.rider.first_name} ${bookDetails.rider.last_name}`}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="phone" size={24} color="black" />
                <Text style={styles.detailText}>
                  {bookDetails.rider.mobile_number}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleContactPress}
            disabled={!bookDetails?.rider?.mobile_number}
          >
            <Text style={styles.buttonText}>Contact</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  mapContainer: {
    flex: 4,
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
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
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
  refreshButton: {
    position: "absolute",
    right: 16,
    top: 5,
    padding: 8,
  },
});

export default TrackingRider;
