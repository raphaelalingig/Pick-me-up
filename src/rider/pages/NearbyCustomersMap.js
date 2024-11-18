import React, { useState, useContext, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Text } from 'react-native-paper';
import { RiderContext } from "../../context/riderContext";
import riderMarker from "../../../assets/rider.png";
import customerMarker from "../../../assets/customer.png";
import { usePusher } from '../../context/PusherContext';
import ApplyRideModal from './ApplyRideModal';
import userService from '../../services/auth&services';

const NearbyCustomersMap = ({ riderLocations, onClose, navigation }) => {
  const { riderCoords } = useContext(RiderContext);
  const [region, setRegion] = useState({
    latitude: riderCoords.latitude,
    longitude: riderCoords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  // const [showApplyModal, setShowApplyModal] = useState(false);
  // const [applyRide, setApplyRide] = useState(null);
  const { 
    applyRide, 
    setApplyRide,
    showApplyModal, 
    setShowApplyModal 
  } = usePusher();
  // const [user_id, setUserId] = useState();

  const handleMarkerPress = (ride) => {
    navigation.navigate("BookingDetails", { ride });
  };

  const validRiders = riderLocations.filter(rider => {
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

  //   useEffect(() => {
  //   const fetchUserId = async () => {
  //     try {
  //       const response = await userService.getUserId();
  //       const id = parseInt(response, 10);
  //       console.log("Fetched user_id:", id);
  //       setUserId(id);
  //     } catch (error) {
  //       console.error("Error fetching user_id:", error);
  //     }
  //   };

  //   fetchUserId();
  // }, []);
  
  return (
    <View style={styles.container}>
      <MapView
      provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        
      >
        {/* Rider Marker */}
        <Marker
          coordinate={{
            latitude: riderCoords.latitude,
            longitude: riderCoords.longitude,
          }}
          title="Your Location"
        >
          <Image source={riderMarker} style={styles.markerIcon} />
        </Marker>

        {/* Customer Markers */}
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
              description={rider.ride_type}
              onCalloutPress={() => handleMarkerPress(ride)}
            >
              <Image source={riderMarker} style={styles.markerIcon} />
            </Marker>
          );
        })}
      </MapView>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close Map</Text>
      </TouchableOpacity>

      {applyRide && (
            <ApplyRideModal
              visible={showApplyModal}
              ride={applyRide}
              userService={userService} 
              navigation={navigation} 
              onClose={() => setShowApplyModal(false)}
            />
          )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1000,
  },
  map: {
    flex: 1,
  },
  markerIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#000000',
    padding: 10,
    borderRadius: 5,
    elevation: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NearbyCustomersMap;
