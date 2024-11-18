// hooks/useLocation.js
import { useState, useEffect, useContext } from 'react';
import * as Location from 'expo-location';
import { CustomerContext } from '../../../../context/customerContext';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const { setCustomerCoords } = useContext(CustomerContext);

  const requestAndUpdateLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Location permission denied');
        return false;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      setCustomerCoords({
        accuracy: currentLocation.coords.accuracy,
        longitude: currentLocation.coords.longitude,
        latitude: currentLocation.coords.latitude,
        altitude: currentLocation.coords.altitude,
        altitudeAccuracy: currentLocation.coords.altitudeAccuracy,
        timestamp: currentLocation.timestamp,
      });

      return true;
    } catch (err) {
      setError('Error fetching location');
      return false;
    }
  };

  return {
    location,
    error,
    requestAndUpdateLocation,
  };
};
