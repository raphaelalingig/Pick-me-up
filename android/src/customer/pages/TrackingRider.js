import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, TouchableOpacity, View, Alert, Dimensions, Image } from "react-native";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import MapView, { Marker, Polyline } from "react-native-maps";
import userService from "../../services/auth&services";
import riderMarker from "../../../assets/rider.png";
import customerMarker from "../../../assets/customer.png";

const TrackingRider = ({ navigation }) => {
  const [bookDetails, setBookDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [riderLocation, setRiderLocation] = useState({ latitude: null, longitude: null });
  const [customerLocation, setCustomerLocation] = useState({ latitude: null, longitude: null });
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [totalFare, setTotalFare] = useState(0);
  const [mapRegion, setMapRegion] = useState(null);
  const [totalDistanceRide, setTotalDistanceRide] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [rider_id, setRiderId] = useState(null);
  const [riderLoc, setRiderLoc] = useState(null);
  const [locationInterval, setLocationInterval] = useState(null);

  const fetchLatestAvailableRide = useCallback(async () => {
    try {
      setRefreshing(true);
      const ride = await userService.checkActiveBook();
      console.log("RIDERRRRRRRR:", ride.rideDetails.rider)
      setRiderId(ride.rideDetails.rider_id);
      setBookDetails(ride.rideDetails);
      const rider = await userService.fetchRiderLoc(ride.rideDetails.rider_id);
      setRiderLoc(rider);
      console.log("DATAAAAA:", rider)

      // Update the rider and customer locations
      setRiderLocation({
        latitude: parseFloat(rider.rider_latitude),
        longitude: parseFloat(rider.rider_longitude),
      });
      setCustomerLocation({
        latitude: parseFloat(ride.rideDetails.customer_latitude),
        longitude: parseFloat(ride.rideDetails.customer_longitude),
      });

      // Recalculate the map region and fetch directions
      calculateMapRegion();
      fetchDirections();
    } catch (error) {
      Alert.alert("Error", "Failed to retrieve the latest available ride.");
      navigation.navigate("Home");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [calculateMapRegion, fetchDirections]);

  useEffect(() => {
    fetchLatestAvailableRide();
  }, [fetchLatestAvailableRide]);

  const riderRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const ride = await userService.checkActiveBook();
      console.log("RIDERRRRRRRR:", ride.rideDetails.rider)
      setRiderId(ride.rideDetails.rider_id);
      setBookDetails(ride.rideDetails);
      const rider = await userService.fetchRiderLoc(ride.rideDetails.rider_id);
      setRiderLoc(rider);
      console.log("DATAAAAA:", rider)

      // Update the rider and customer locations
      setRiderLocation({
        latitude: parseFloat(rider.rider_latitude),
        longitude: parseFloat(rider.rider_longitude),
      });
      setCustomerLocation({
        latitude: parseFloat(ride.rideDetails.customer_latitude),
        longitude: parseFloat(ride.rideDetails.customer_longitude),
      });

      // Recalculate the map region and fetch directions
      calculateMapRegion();
      fetchDirections();
    } catch (error) {
      Alert.alert("Error", "Failed to retrieve the latest available ride.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [calculateMapRegion, fetchDirections]);



  // useEffect(() => {
  //   if (bookDetails) {
  //     setCustomerLocation({
  //       latitude: parseFloat(bookDetails.customer_latitude),
  //       longitude: parseFloat(bookDetails.customer_longitude),
  //     });
  //   }
  // }, [bookDetails]);

  // useEffect(() => {
  //   if (riderLoc) {
  //     setRiderLocation({
  //       latitude: parseFloat(riderLoc.rider_latitude),
  //       longitude: parseFloat(riderLoc.rider_longitude),
  //     });
  //   }
  // }, [riderLoc]);
  

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

    const minLat = Math.min(customerLocation.latitude, riderLocation.latitude);
    const maxLat = Math.max(customerLocation.latitude, riderLocation.latitude);
    const minLng = Math.min(
      customerLocation.longitude,
      riderLocation.longitude,
    );
    const maxLng = Math.max(
      customerLocation.longitude,
      riderLocation.longitude,
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


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome5 name="users" size={24} color="black" />
        {bookDetails && bookDetails.ride_type !== null && (
          <Text style={styles.serviceTitle}>{bookDetails.ride_type}</Text>
        )}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchLatestAvailableRide}
          disabled={refreshing}
        >
          <MaterialCommunityIcons name={refreshing ? "loading" : "refresh"} size={24} color="black" />
        </TouchableOpacity>
      </View>
  
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
        >
          {riderLocation && riderLocation.latitude !== null && riderLocation.longitude !== null && (
            <Marker coordinate={riderLocation} title="Rider Location">
              <Image source={riderMarker} style={styles.riderIconStyle} />
            </Marker>
          )}
          {customerLocation && customerLocation.latitude !== null && customerLocation.longitude !== null && (
            <Marker
              coordinate={customerLocation}
              title="Customer Location"
              pinColor="blue"
            >
              <Image source={customerMarker} style={styles.customerIconStyle} />
            </Marker>
          )}
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#FF0000"
            strokeWidth={3}
          />
        </MapView>
      </View>
  
      <View style={styles.detailsContainer}>
        <View style={styles.customerDetails}>
          <Text style={styles.subTitle}>Rider Details</Text>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="account" size={24} color="black" />
            {bookDetails && bookDetails.rider !== null && (
              <Text style={styles.detailText}>
                {bookDetails.rider.first_name} {bookDetails.rider.last_name}
              </Text>
            )}
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="phone" size={24} color="black" />
            {bookDetails && bookDetails.rider !== null && (
              <Text style={styles.detailText}>
                {bookDetails.rider.mobile_number}
              </Text>
            )}
          </View>
        </View>
  
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>Contact</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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