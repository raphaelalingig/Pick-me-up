// navigation/stacks/CustomerStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationTheme } from '../theme';
import { ROUTES } from '../routes';
import { CustomerDrawerNavigation } from '../drawers/CustomerDrawer';
// Import your screens here

import MotorTaxiOptionScreen from "../../customer/pages/MotorTaxiOp";
import PakyawOptionScreen from "../../customer/pages/PakyawOp";
import DeliveryOptionScreen from "../../customer/pages/DeliveryOp";
import TrackingRider from "../../customer/pages/TrackingRider";
import InTransit from "../../customer/pages/InTransit";
import CompleteRide from "../../customer/pages/Complete Ride";
import SubmitFeedback_C from "../../customer/pages/Creport";
import CustomerMap from "../../customer/pages/CustomerMap";
import WaitingRider from "../../customer/pages/WaitingForRider";
import MapPicker from "../../customer/pages/MapPicker";

const Stack = createNativeStackNavigator();

export const CustomerStack = () => (
  <Stack.Navigator screenOptions={navigationTheme}>
    <Stack.Screen
      name="CustomerDrawer"
      component={CustomerDrawerNavigation}
      options={{ headerShown: false }}
    />
    {/* Services */}
    <Stack.Screen 
      name={ROUTES.CUSTOMER.SERVICES.MOTOR_TAXI} 
      component={MotorTaxiOptionScreen} 
    />
    <Stack.Screen 
      name={ROUTES.CUSTOMER.SERVICES.PAKYAW} 
      component={PakyawOptionScreen} 
    />
    <Stack.Screen 
      name={ROUTES.CUSTOMER.SERVICES.DELIVERY} 
      component={DeliveryOptionScreen} 
    />
    
    {/* Booking Flow */}
    <Stack.Screen 
      name={ROUTES.CUSTOMER.BOOKING.WAITING} 
      component={WaitingRider} 
    />
    <Stack.Screen 
      name={ROUTES.CUSTOMER.BOOKING.TRACKING} 
      component={TrackingRider} 
    />
    <Stack.Screen 
      name={ROUTES.CUSTOMER.BOOKING.IN_TRANSIT} 
      component={InTransit} 
    />
    <Stack.Screen 
      name={ROUTES.CUSTOMER.BOOKING.REVIEW} 
      component={CompleteRide} 
    />
    <Stack.Screen 
      name={ROUTES.CUSTOMER.BOOKING.FEEDBACK} 
      component={SubmitFeedback_C} 
    />
    
    {/* Maps */}
    <Stack.Screen 
      name={ROUTES.CUSTOMER.MAP.LOCATION} 
      component={CustomerMap} 
    />
    <Stack.Screen 
      name={ROUTES.CUSTOMER.MAP.PICKER} 
      component={MapPicker} 
    />
  </Stack.Navigator>
);