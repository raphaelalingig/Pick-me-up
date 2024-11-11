import { StyleSheet, Text, View } from "react-native";
import React, { useState, useContext } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Button } from "react-native-paper";
import { CustomerContext } from "../../context/customerContext";

const CustomerMap = () => {
  const { customerCoords } = useContext(CustomerContext);
  const [customerLocation, setCustomerLocation] = useState({
    latitude: customerCoords.latitude,
    longitude: customerCoords.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={customerLocation} provider={PROVIDER_GOOGLE}>
        <Marker coordinate={customerLocation} title="Customer Marker" />
      </MapView>
    </View>
  );
};

export default CustomerMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
