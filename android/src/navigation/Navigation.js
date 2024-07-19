import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import Login from "../forms/Login";
import Home from "../customer/pages/Home";
import History from "../customer/pages/History";
import Settings from "../customer/pages/Settings";
import RiderHistory from "../rider/pages/History";
import RiderSettings from "../rider/pages/Settings";
import GetVerified from "../rider/pages/GetVerified";
import RiderHome from "../rider/pages/Home"
import Register from "../forms/Register";

const Drawer = createDrawerNavigator();

const CustomerDrawerNavigation = () => {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="History" component={History} />
      <Drawer.Screen name="Settings" component={Settings} />
    </Drawer.Navigator>
  );
};

const RiderDrawerNavigation = () => {
  return (
    <Drawer.Navigator initialRouteName="Home">
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
      <Drawer.Navigator initialRouteName="Login">
        <Drawer.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Drawer.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false }}
        />
        <Drawer.Screen
          name="CustomerHome"
          component={CustomerDrawerNavigation}
          options={{ headerShown: false }}
        />
        <Drawer.Screen
          name="RiderHome"
          component={RiderDrawerNavigation}
          options={{ headerShown: false }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
