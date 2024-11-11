// MapComponent.js
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import riderMarker from "../../../assets/rider.png";
import customerMarker from "../../../assets/customer.png";

const MapComponent = ({ riderLocation, customerLocation, routeCoordinates, mapRegion }) => {
  const [localRegion, setLocalRegion] = useState(mapRegion);

  useEffect(() => {
    setLocalRegion(mapRegion);
  }, [mapRegion]);

  return (
    <View style={styles.mapContainer}>
      <MapView style={styles.map} region={localRegion} provider={PROVIDER_GOOGLE}>
        {riderLocation && (
          <Marker coordinate={riderLocation} title="Rider Location">
            <Image source={riderMarker} style={styles.riderIconStyle} />
          </Marker>
        )}
        {customerLocation && (
          <Marker coordinate={customerLocation} title="Customer Location">
            <Image source={customerMarker} style={styles.customerIconStyle} />
          </Marker>
        )}
        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeColor="#FF0000" strokeWidth={3} />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
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

export default MapComponent;
