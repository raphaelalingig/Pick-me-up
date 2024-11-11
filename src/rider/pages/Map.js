import { StyleSheet, Text, View } from "react-native";
import React, { useState, useContext } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Button } from "react-native-paper";
import { RiderContext } from "../../context/riderContext";

const Map = () => {
  const { riderCoords } = useContext(RiderContext);
  const [riderLocation, setRiderLocation] = useState({
    latitude: riderCoords.latitude,
    longitude: riderCoords.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={riderLocation}
        provider={PROVIDER_GOOGLE}
      >
        <Marker coordinate={riderLocation} title="Rider Marker" />
      </MapView>
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
