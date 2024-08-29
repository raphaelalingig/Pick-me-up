import { StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect, useContext } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import { RiderContext } from "../../context/riderContext";

const BookedMap = () => {
  const { riderCoords } = useContext(RiderContext);

  // Provide default values in case riderCoors is undefined
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
          coordinates={[riderLocation, customerLocation]}
          strokeColor="#FF0000" // Red color for the path
          strokeWidth={2}
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
