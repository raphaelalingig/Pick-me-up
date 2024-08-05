import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";

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
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BookingDetailsScreen from "../rider/pages/BookingDetailsScreen";
import CustomDrawerContent from "./CustomDrawerContent";


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
      <Drawer.Screen name="Home" component={RiderHome} />
      <Drawer.Screen name="Get Verified" component={GetVerified} />
      <Drawer.Screen name="History" component={RiderHistory} />
      <Drawer.Screen name="Settings" component={RiderSettings} />
    </Drawer.Navigator>
  );
};

const Navigation = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Login"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CustomerHome"
          component={CustomerDrawerNavigation}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RiderHome"
          component={RiderDrawerNavigation}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen name="NearbyCustomer" component={NearbyCustomerScreen} />

        <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
      </Stack.Navigator>
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
