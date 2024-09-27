import React, { useState, useEffect, useContext, useCallback } from "react";
import { StyleSheet, TouchableOpacity, View, Alert, Dimensions } from "react-native";
import { Text } from "react-native-paper";
import MapView, { Marker, Polyline } from "react-native-maps";
import userService from "../../services/auth&services";
import { RiderContext } from "../../context/riderContext";

const TrackingDestination = ({ route, navigation }) => {
  const { ride } = route.params;
  const { riderCoords, totalDistanceRide, setTotalDistanceRide } = useContext(RiderContext);
  const [isLoading, setIsLoading] = useState(false);
  const [riderLocation, setRiderLocation] = useState({
    latitude: riderCoords.latitude || 8.4955,
    longitude: riderCoords.longitude || 124.5999
  });
  const [destinationLocation, setDestinationLocation] = useState({
    latitude: ride.destination_latitude || 8.48488061840282,
    longitude: ride.destination_longitude || 124.65672484721037, 
  });
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [totalFare, setTotalFare] = useState(0);
  const [mapRegion, setMapRegion] = useState(null);

  useEffect(() => {
    if (riderCoords.latitude && riderCoords.longitude) {
      setRiderLocation({
        ...riderLocation,
        latitude: riderCoords.latitude,
        longitude: riderCoords.longitude,
      });
    }
  }, [riderCoords]);

  useEffect(() => {
    fetchDirections();
    calculateMapRegion();
  }, [riderLocation, destinationLocation]);

  const calculateMapRegion = () => {
    const minLat = Math.min(riderLocation.latitude, destinationLocation.latitude);
    const maxLat = Math.max(riderLocation.latitude, destinationLocation.latitude);
    const minLng = Math.min(riderLocation.longitude, destinationLocation.longitude);
    const maxLng = Math.max(riderLocation.longitude, destinationLocation.longitude);

    const latDelta = (maxLat - minLat) * 1.5; // Add some padding
    const lngDelta = (maxLng - minLng) * 1.5;

    setMapRegion({
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.02),
      longitudeDelta: Math.max(lngDelta, 0.02),
    });
  };

  useEffect(() => {
    if (totalDistanceRide) {
      calculateFare(totalDistanceRide);
    }
  }, [totalDistanceRide]);

  const fetchDirections = async () => {
    try {
      const apiKey = "AIzaSyAekXSq_b4GaHneUKEBVsl4UTGlaskobFo";
      const origin = `${riderLocation.latitude},${riderLocation.longitude}`;
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

  const completeRide = async () => {
    setIsLoading(true);
    try {
      const response = await userService.complete_ride(ride.ride_id);
      if (response.data && response.data.message) {
        Alert.alert("Success", response.data.message);
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", "Failed to finish the ride. Please try again.");
      }
    } catch (error) {
      console.error("Failed to finish ride", error.response ? error.response.data : error.message);
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
          onMapReady={calculateMapRegion}>
          <Marker coordinate={riderLocation} title="Rider Location" />
          <Marker coordinate={destinationLocation} title="Destination" pinColor="green" />
          <Polyline coordinates={routeCoordinates} strokeColor="#FF0000" strokeWidth={3} />
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
            onPress={completeRide}
          >
            <Text style={styles.buttonText}>Arrived</Text>
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
    flex: 3, // Takes up 3/4 of the screen
  },
  map: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1, // Takes up 1/4 of the screen
    backgroundColor: "#FFC533",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    backgroundColor: "#158D01",
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  arrivedButton: {
    backgroundColor: "#0066cc",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TrackingDestination;