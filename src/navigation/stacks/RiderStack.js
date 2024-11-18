// navigation/stacks/RiderStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationTheme } from '../theme';
import { ROUTES } from '../routes';
import { RiderDrawerNavigation } from '../drawers/RiderDrawer';

const Stack = createNativeStackNavigator();

export const RiderStack = () => (
  <Stack.Navigator screenOptions={navigationTheme}>
    <Stack.Screen
      name="RiderDrawer"
      component={RiderDrawerNavigation}
      options={{ headerShown: false }}
    />
    {/* Booking Flow */}
    <Stack.Screen 
      name={ROUTES.RIDER.BOOKING.NEARBY} 
      component={NearbyCustomerScreen} 
    />
    <Stack.Screen 
      name={ROUTES.RIDER.BOOKING.DETAILS} 
      component={BookingDetailsScreen} 
    />
    <Stack.Screen 
      name={ROUTES.RIDER.BOOKING.TRACKING.CUSTOMER} 
      component={TrackingCustomer} 
    />
    <Stack.Screen 
      name={ROUTES.RIDER.BOOKING.TRACKING.DESTINATION} 
      component={TrackingDestination} 
    />
    <Stack.Screen 
      name={ROUTES.RIDER.BOOKING.COMPLETE} 
      component={FinishRide} 
    />
    <Stack.Screen 
      name={ROUTES.RIDER.BOOKING.FEEDBACK} 
      component={SubmitFeedback_R} 
    />
    
    {/* Maps */}
    <Stack.Screen 
      name={ROUTES.RIDER.MAP.CURRENT} 
      component={Map} 
    />
    <Stack.Screen 
      name={ROUTES.RIDER.MAP.BOOKED} 
      component={BookedMap} 
    />
  </Stack.Navigator>
);
