import React, { useCallback, useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, Alert } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

const RenderMapView = ({
  bookDetails,
  riderLocs,
  customerLat,
  customerLng,
  region,
  setRegion,
  handleMarkerPress,
  customerMarker,
  riderMarker,
  onRefreshRiders
}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  // Get user's current location
  const getCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for this feature.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (mapRef) {
        mapRef.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location.');
    }
  }, [mapRef]);

  // Filter valid riders
  const validRiders = riderLocs.filter(rider => {
    const hasValidLocation = 
      rider.rider_latitude != null && 
      rider.rider_longitude != null &&
      !isNaN(parseFloat(rider.rider_latitude)) && 
      !isNaN(parseFloat(rider.rider_longitude));
    
    if (!hasValidLocation) {
      console.log(`Skipping rider ${rider.rider_id} - Invalid location data`);
    }
    return hasValidLocation;
  });

  // Render custom callout for riders
  const renderRiderCallout = (rider) => (
    <Callout onPress={() => handleMarkerPress(rider)}>
      <Card style={styles.calloutCard}>
        <Card.Content>
          <Text style={styles.riderName}>
            {rider.user.first_name} {rider.user.last_name}
          </Text>
          <Text style={styles.riderInfo}>Rating: 4.4 ⭐</Text>
          <Text style={styles.riderInfo}>
            Status: {rider.availability}
          </Text>
          <Button 
            mode="contained" 
            onPress={() => handleMarkerPress(rider)}
            style={styles.selectButton}
          >
            Select Rider
          </Button>
        </Card.Content>
      </Card>
    </Callout>
  );

  // Map controls component
  const MapControls = () => (
    <View style={styles.mapControls}>
      <Button 
        mode="contained" 
        onPress={getCurrentLocation}
        icon="crosshairs-gps"
        style={styles.locationButton}
      >
        My Location
      </Button>
      <Button 
        mode="contained" 
        onPress={onRefreshRiders}
        icon="refresh"
        style={styles.refreshButton}
      >
        Refresh Riders
      </Button>
    </View>
  );

  if (!bookDetails) return null;

  return (
    <View style={styles.container}>
      <MapView
        ref={ref => setMapRef(ref)}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
      >
        {/* Customer Marker */}
        {!isNaN(customerLat) && !isNaN(customerLng) && (
          <Marker
            coordinate={{
              latitude: customerLat,
              longitude: customerLng
            }}
            title="Pickup Location"
            description={bookDetails.pickup_location}
          >
            <Image source={customerMarker} style={styles.markerIcon} />
          </Marker>
        )}

        {/* Destination Marker */}
        {bookDetails.dropoff_latitude && bookDetails.dropoff_longitude && (
          <Marker
            coordinate={{
              latitude: parseFloat(bookDetails.dropoff_latitude),
              longitude: parseFloat(bookDetails.dropoff_longitude)
            }}
            title="Drop-off Location"
            description={bookDetails.dropoff_location}
            pinColor="red"
          />
        )}

        {/* Rider Markers */}
        {validRiders.map((rider) => {
          const riderLat = parseFloat(rider.rider_latitude);
          const riderLng = parseFloat(rider.rider_longitude);
          
          return (
            <Marker
              key={`rider-${rider.rider_id}`}
              coordinate={{
                latitude: riderLat,
                longitude: riderLng
              }}
              title={`${rider.user.first_name} ${rider.user.last_name}`}
              description={`Status: ${rider.verification_status}`}
            >
              <Image source={riderMarker} style={styles.markerIcon} />
              {renderRiderCallout(rider)}
            </Marker>
          );
        })}
      </MapView>

      <MapControls />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: height * 0.8,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  calloutCard: {
    width: 200,
    borderRadius: 10,
  },
  riderName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  riderInfo: {
    fontSize: 14,
    marginBottom: 2,
  },
  selectButton: {
    marginTop: 8,
    backgroundColor: '#007BFF',
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    gap: 8,
  },
  locationButton: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    elevation: 4,
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    elevation: 4,
  },
});

export default RenderMapView;