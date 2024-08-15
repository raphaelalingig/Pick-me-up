import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../services/useAuth";
import Login from "../forms/Login";
import Home from "../customer/pages/Home";
import History from "../customer/pages/History";
import Settings from "../customer/pages/Settings";

import RiderHistory from "../rider/sidebarContents/History";
import RiderSettings from "../rider/sidebarContents/Settings";
import GetVerified from "../rider/sidebarContents/GetVerified";
import RiderHome from "../rider/pages/Home";
import Register from "../forms/Register";
import NearbyCustomerScreen from "../rider/pages/NearByCustomer";
import BookingDetailsScreen from "../rider/pages/BookingDetailsScreen";
import CustomDrawerContent from "./CustomDrawerContent";
import AvatarRider from "../rider/avatarDropdown/AvatarRider";
import MotorTaxiOptionScreen from "../customer/pages/MotorTaxiOp";
import PakyawOptionScreen from "../customer/pages/PakyawOp";
import DeliveryOptionScreen from "../customer/pages/DeliveryOp";
import DeliveryConfirmationScreen from "../customer/pages/TrackingRider";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const CustomerDrawerNavigation = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="History" component={History} />
      <Drawer.Screen name="Settings" component={Settings} />
    </Drawer.Navigator>
  );
};

const RiderDrawerNavigation = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Home"
        component={RiderHome}
        options={{
          headerRight: () => <AvatarRider />,
        }}
      />
      <Drawer.Screen
        name="Get Verified"
        component={GetVerified}
        options={{
          headerRight: () => <AvatarRider />,
        }}
      />
      <Drawer.Screen
        name="Booking History"
        component={RiderHistory}
        options={{
          headerRight: () => <AvatarRider />,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={RiderSettings}
        options={{
          headerRight: () => <AvatarRider />,
        }}
      />
    </Drawer.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
};

const CustomerStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CustomerDrawer"
        component={CustomerDrawerNavigation}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="NearbyCustomer" component={NearbyCustomerScreen} />
      <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
      <Stack.Screen name="Motor Taxi" component={MotorTaxiOptionScreen} />
      <Stack.Screen name="Pakyaw" component={PakyawOptionScreen} />
      <Stack.Screen name="Delivery" component={DeliveryOptionScreen} />
      <Stack.Screen
        name="Tracking Rider"
        component={DeliveryConfirmationScreen}
      />
    </Stack.Navigator>
  );
};

const RiderStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="RiderDrawer"
        component={RiderDrawerNavigation}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Nearby Customer" component={NearbyCustomerScreen} />
      <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
    </Stack.Navigator>
  );
};

const RootStack = () => {
  const { isAuthenticated, userRole, loading } = useAuth();

  console.log("RootStack render:", { isAuthenticated, userRole, loading });

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : userRole === 3 ? (
        <Stack.Screen name="RiderStack" component={RiderStack} />
      ) : (
        <Stack.Screen name="CustomerStack" component={CustomerStack} />
      )}
    </Stack.Navigator>
  );
};

const Navigation = () => {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
};

export default Navigation;
