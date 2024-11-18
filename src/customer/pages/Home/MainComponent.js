// MainComponent.js
import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, View, StyleSheet, Text, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
// import { COLORS } from '../../../constants'; // Adjust this path based on where your constants are
import { COLORS } from './constants/theme';
import BookNowScreen from './screens/BookNowScreen'; // Changed to default import
import ChooseServiceScreen from './screens/ChooseServiceScreen'; // Changed to default import
import { useLocation } from './hooks/useLocation';
import userService from '../../../services/auth&services';

// C:\Users\juato\OneDrive\Documents\Pick-me-up\src\customer\pages\Home\screens\BookNowScreen,js


const MainComponent = ({ navigation }) => {
  const [currentForm, setCurrentForm] = useState('BookNow');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { error: locationError, requestAndUpdateLocation } = useLocation();

  const checkRideAndLocation = useCallback(async () => {
    try {
      const locationGranted = await requestAndUpdateLocation();
      if (!locationGranted) return 'location_denied';

      const response = await userService.checkActiveBook();
      if (response && response.hasActiveRide) {
        const { status, rideDetails } = response;
        const screenMap = {
          Available: 'WaitingForRider',
          Booked: 'Tracking Rider',
          'In Transit': 'In Transit',
          Review: 'To Review',
        };

        if (screenMap[status]) {
          navigation.navigate(screenMap[status], { ride: rideDetails });
          return 'existing_ride';
        }
      }

      return 'proceed';
    } catch (error) {
      console.error('Error in checkRideAndLocation:', error);
      return 'error';
    }
  }, [navigation, requestAndUpdateLocation]);

  const handleBookNow = async () => {
    setLoading(true);
    try {
      const userStatus = await userService.fetchCustomer();
      if (userStatus.message === 'Account Disabled') {
        Alert.alert('Account Disabled', 'Contact Admin for more info.');
        return;
      }

      const result = await checkRideAndLocation();
      if (result === 'proceed') {
        setCurrentForm('ChooseServiceScreen');
      }
    } catch (error) {
      console.error('Error in handleBookNow:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkRideAndLocation();
    setRefreshing(false);
  }, [checkRideAndLocation]);

  useFocusEffect(
    useCallback(() => {
      checkRideAndLocation();
    }, [checkRideAndLocation])
  );

  if (locationError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{locationError}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {currentForm === 'BookNow' ? (
        <BookNowScreen
          onBookNow={handleBookNow}
          loading={loading}
          navigation={navigation}
        />
      ) : (
        <ChooseServiceScreen
          navigation={navigation}
          onCancel={() => setCurrentForm('BookNow')}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    fontSize: 16,
  },
});

export default MainComponent;