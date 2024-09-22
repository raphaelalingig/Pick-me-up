import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { RiderContext } from "../../context/riderContext";

const BookedMap = () => {
  const { riderCoords } = useContext(RiderContext);

  const [riderLocation, setRiderLocation] = useState({
    latitude: riderCoords.latitude,
    longitude: riderCoords.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [customerLocation, setCustomerLocation] = useState({
    latitude: 8.4955,
    longitude: 124.5999,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    fetchDirections();
  }, [riderLocation, customerLocation]);

  const fetchDirections = async () => {
    try {
      const apiKey = "//";
      const origin = `${riderLocation.latitude},${riderLocation.longitude}`;
      const destination = `${customerLocation.latitude},${customerLocation.longitude}`;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.routes.length) {
        const points = result.routes[0].overview_polyline.points;
        const decodedPoints = decodePolyline(points);
        setRouteCoordinates(decodedPoints);
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
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
      <MapView style={styles.map} region={riderLocation}>
        <Marker coordinate={riderLocation} title="Rider Marker" />
        <Marker
          coordinate={customerLocation}
          title="Customer Marker"
          pinColor="blue"
        />
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#FF0000"
          strokeWidth={3}
        />
      </MapView>
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
});
