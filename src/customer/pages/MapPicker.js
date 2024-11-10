import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const MapPicker = ({ route, navigation }) => {
    const { locationType } = route.params;
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [address, setAddress] = useState('');
    const [initialRegion, setInitialRegion] = useState(null);

    useEffect(() => {
        (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission to access location was denied');
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setInitialRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        });
        setSelectedLocation({ latitude, longitude });
        await getAddress({ latitude, longitude });
        })();
    }, []);

    const getAddress = async (location) => {
        try {
        const result = await Location.reverseGeocodeAsync(location);
        if (result.length > 0) {
            const { street, city, region, country } = result[0];
            const formattedAddress = `${street}, ${city}, ${region}, ${country}`;
            setAddress(formattedAddress);
        }
        } catch (error) {
        console.error('Error getting address:', error);
        setAddress('Address not found');
        }
    };

    const handleMapPress = async (e) => {
        const newLocation = e.nativeEvent.coordinate;
        setSelectedLocation(newLocation);
        await getAddress(newLocation);
    };

    const handleConfirm = () => {
        navigation.navigate('Motor Taxi', {
          selectedLocation: selectedLocation,
          address: address,
          locationType: locationType
        });
    };

    if (!initialRegion) {
        return (
        <View style={styles.container}>
            <Text>Loading map...</Text>
        </View>
        );
    }

    return (
        <View style={styles.container}>
        <MapView
            style={styles.map}
            onPress={handleMapPress}
            initialRegion={initialRegion}
        >
            {selectedLocation && <Marker coordinate={selectedLocation} />}
        </MapView>
        <View style={styles.addressContainer}>
            <Text style={styles.addressText}>{address}</Text>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  addressContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
  addressText: {
    fontSize: 14,
  },
  confirmButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#FFD700',
    padding: 10,
    borderRadius: 5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MapPicker;