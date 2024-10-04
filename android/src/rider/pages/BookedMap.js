import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { RiderContext } from "../../context/riderContext";
import { Button, Text } from "react-native-paper";

const BookedMap = ({ navigation, route }) => {
  const { ride } = route.params; // Assuming the ride data is passed as a route parameter
  const { riderCoords, totalDistanceRide, setTotalDistanceRide } =
    useContext(RiderContext);

  const [riderLocation, setRiderLocation] = useState({
    latitude: riderCoords.latitude,
    longitude: riderCoords.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [customerLocation, setCustomerLocation] = useState({
    latitude: parseFloat(ride.ridelocations.customer_latitude),
    longitude: parseFloat(ride.ridelocations.customer_longitude),
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [totalFare, setTotalFare] = useState(parseFloat(ride.fare));

  useEffect(() => {
    fetchDirections();
  }, [riderLocation, customerLocation]);

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

  // Function to calculate fare based on distance
  const calculateFare = (distance) => {
    const baseFare = 40; // Base fare for the first 2 kilometers
    const additionalFareRate = 10; // Fare per kilometer after 2 km
    const thresholdKm = 2; // First 2 kilometers

    let fare;
    if (distance <= thresholdKm) {
      fare = baseFare; // If distance is within 2 km, base fare applies
    } else {
      const exceedingDistance = distance - thresholdKm; // Distance above 2 km
      fare = baseFare + exceedingDistance * additionalFareRate; // Base fare + fare for exceeding distance
    }

    setTotalFare(fare.toFixed(2)); // Set the total fare and limit to 2 decimal places
  };

  // Helper function to decode Google's encoded polyline
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
      <MapView 
        style={styles.map} 
        region={{
          ...customerLocation,
          latitudeDelta: Math.max(0.05, Math.abs(customerLocation.latitude - riderLocation.latitude) * 2),
          longitudeDelta: Math.max(0.05, Math.abs(customerLocation.longitude - riderLocation.longitude) * 2),
        }}
      >
        <Marker coordinate={riderLocation} title="Rider Location" />
        <Marker
          coordinate={customerLocation}
          title="Customer Location"
          pinColor="blue"
        />
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#FF0000"
          strokeWidth={3}
        />
      </MapView>

      <View style={styles.distanceContainer}>
        <Text style={styles.distanceText}>
          Total Distance: {totalDistanceRide} km
        </Text>
        <Text style={styles.totalFare}>Total Fare: ₱{totalFare}</Text>
      </View>
      <View style={styles.nextButtonContainer}>
        <Button
          style={styles.nextButtonStyle}
          onPress={() => navigation.navigate("Submit Report")}
        >
          <Text variant="labelLarge" style={{ color: "white" }}>
            Next
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default BookedMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  distanceContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 5,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalFare: {
    fontSize: 16,
    fontWeight: "bold",
  },

  nextButtonContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    padding: 5,
    borderRadius: 5,
  },

  nextButtonStyle: {
    backgroundColor: "#008000",
    borderRadius: 5,
  },
});
