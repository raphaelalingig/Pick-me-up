import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View, Image } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { RiderContext } from "../../context/riderContext";
import { Button, Text } from "react-native-paper";
import riderMarker from "../../../assets/rider.png";
import customerMarker from "../../../assets/customer.png";

const BookedMap = ({ navigation, route }) => {
  const { ride } = route.params;
  const { riderCoords, totalDistanceRide, setTotalDistanceRide } =
    useContext(RiderContext);

  const [riderLocation, setRiderLocation] = useState({
    latitude: riderCoords.latitude,
    longitude: riderCoords.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [customerLocation, setCustomerLocation] = useState({
    latitude: parseFloat(ride.customer_latitude),
    longitude: parseFloat(ride.customer_longitude),
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [totalFare, setTotalFare] = useState(parseFloat(ride.fare));

  // Google Maps specific styling
  const mapStyle = [
    {
      featureType: "all",
      elementType: "geometry",
      stylers: [{ color: "#242f3e" }],
    },
    {
      featureType: "all",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#242f3e" }],
    },
    {
      featureType: "all",
      elementType: "labels.text.fill",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ];

  useEffect(() => {
    fetchDirections();
  }, [riderLocation, customerLocation]);

  const fetchDirections = async () => {
    try {
      const apiKey = "AIzaSyAekXSq_b4GaHneUKEBVsl4UTGlaskobFo"; // Your API key
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
        calculateFare(parseFloat(totalDistanceKm));
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
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={mapStyle}
        region={{
          ...customerLocation,
          latitudeDelta: Math.max(
            0.05,
            Math.abs(customerLocation.latitude - riderLocation.latitude) * 2
          ),
          longitudeDelta: Math.max(
            0.05,
            Math.abs(customerLocation.longitude - riderLocation.longitude) * 2
          ),
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsTraffic={true}
      >
        <Marker coordinate={riderLocation} title="Rider Location">
          <Image source={riderMarker} style={styles.riderIconStyle} />
        </Marker>
        <Marker
          coordinate={customerLocation}
          title="Customer Location"
          pinColor="blue"
        >
          <Image source={customerMarker} style={styles.customerIconStyle} />
        </Marker>
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#4285F4" // Google Maps blue color
          strokeWidth={3}
        />
      </MapView>

      <View style={styles.distanceContainer}>
        <Text style={styles.distanceText}>
          Total Distance: {totalDistanceRide} km
        </Text>
        <Text style={styles.totalFare}>Total Fare: ₱{totalFare}</Text>
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalFare: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
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
});