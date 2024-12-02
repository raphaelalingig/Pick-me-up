import React from "react";
import { ActivityIndicator } from "react-native";
import { StatusBar } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "../services/useAuth";
import Icon from "react-native-vector-icons/Ionicons";
import CustomDrawerContent from "./CustomDrawerContent";
import AvatarRider from "../rider/avatarDropdown/AvatarRider";
import AvatarCustomer from "../customer/pages/AvatarCustomer";


import { navigationRef } from "./NavigationService";

// Import your screens here
import Login from "../forms/Login";
import Home from "../customer/pages/Home";
// import MainComponent from "../customer/pages/Home/MainComponent";
import History from "../customer/pages/History";
import Settings from "../customer/pages/Settings";
import RiderHome from "../rider/pages/Home";
import GetVerified from "../rider/sidebarContents/GetVerified";
import RiderHistory from "../rider/sidebarContents/History";
import RiderSettings from "../rider/sidebarContents/Settings";
import Register from "../forms/Register";
import Confirmation from "../forms/Confirmation";
import NearbyCustomerScreen from "../rider/pages/NearByCustomer";
import BookingDetailsScreen from "../rider/pages/BookingDetailsScreen";
import MotorTaxiOptionScreen from "../customer/pages/MotorTaxiOp";
import PakyawOptionScreen from "../customer/pages/PakyawOp";
import DeliveryOptionScreen from "../customer/pages/DeliveryOp";
import TrackingRider from "../customer/pages/TrackingRider";
import AccountSettingsScreen from "../customer/pages/Settings";
import InTransit from "../customer/pages/InTransit";
import CompleteRide from "../customer/pages/Complete Ride";
import FinishRide from "../rider/pages/FinishRide";
import SubmitFeedback_C from "../customer/pages/CustomerFeedback";
import SubmitFeedback_R from "../rider/pages/SubmitReport";
import Map from "../rider/pages/Map";
import CustomerMap from "../customer/pages/CustomerMap";
import BookedMap from "../rider/pages/BookedMap";
import WaitingRider from "../customer/pages/WaitingForRider";
import TrackingDestination from "../rider/pages/TrackingDestination";
import TrackingCustomer from "../rider/pages/TrackingCustomer";
import MapPicker from "../customer/pages/MapPicker";
import ReportRiderPage from "../customer/pages/ReportRider";
import Delivery from "../customer/pages/DeliveryWaiting";
import WaitingPakyaw from "../customer/pages/PakyawWaiting";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const CustomerDrawerNavigation = () => {
  const { userRole } = useAuth();

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FBC635",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: "#000000",
        drawerActiveTintColor: "#000000",
        drawerInactiveTintColor: "#555555",
      }}
    >
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="home-outline" color={color} size={size} />
          ),
          headerRight: () => userRole === 4 ? null : <AvatarCustomer />,
        }}
      />
      <Drawer.Screen
        name="History"
        component={History}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="time-outline" color={color} size={size} />
          ),
          headerRight: () => userRole === 4 ? null : <AvatarCustomer />,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={Settings}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="settings-outline" color={color} size={size} />
          ),
          headerRight: () => userRole === 4 ? null : <AvatarCustomer />,
        }}
      />
    </Drawer.Navigator>
  );
};

const RiderDrawerNavigation = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FBC635",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: "#000000",
        drawerActiveTintColor: "#000000",
        drawerInactiveTintColor: "#555555",
      }}
    >
      <Drawer.Screen
        name="Home"
        component={RiderHome}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="home-outline" color={color} size={size} />
          ),
          headerRight: () => <AvatarRider />,
        }}
      />
      <Drawer.Screen
        name="Get Verified"
        component={GetVerified}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="checkmark-circle-outline" color={color} size={size} />
          ),
          headerRight: () => <AvatarRider />,
        }}
      />
      <Drawer.Screen
        name="Booking History"
        component={RiderHistory}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="time-outline" color={color} size={size} />
          ),
          headerRight: () => <AvatarRider />,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={RiderSettings}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="settings-outline" color={color} size={size} />
          ),
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
      <Stack.Screen name="Confirmation" component={Confirmation} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
};

const CustomerStack = () => {
  const { isAuthenticated, userRole, loading } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FBC635",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: "#000000",
      }}
    >
      <Stack.Screen
        name="CustomerDrawer"
        component={CustomerDrawerNavigation}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="NearbyCustomer" component={NearbyCustomerScreen} />
      <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
      <Stack.Screen name="MapPicker" component={MapPicker} />
      <Stack.Screen name="Moto Taxi" component={MotorTaxiOptionScreen} />
      <Stack.Screen name="Book Pakyaw" component={PakyawOptionScreen} />
      <Stack.Screen name="Delivery" component={DeliveryOptionScreen} />
      <Stack.Screen name="Settings" component={AccountSettingsScreen} />
      <Stack.Screen name="WaitingForRider" component={WaitingRider} />
      <Stack.Screen name="WaitingForDelivery" component={Delivery} />
      <Stack.Screen name="Pakyaw" component={WaitingPakyaw} />
      <Stack.Screen
        name="Tracking Rider"
        component={TrackingRider}
      />
      <Stack.Screen name="In Transit" component={InTransit} />
      <Stack.Screen name="To Review" component={CompleteRide} />
      <Stack.Screen name="Location" component={CustomerMap} />
      <Stack.Screen name="Report" component={ReportRiderPage} />
      <Stack.Screen name="CustomerFeedback" component={SubmitFeedback_C} />
      {userRole === 3 || userRole === 1 || userRole === 2 && (
        <Stack.Screen
          name="RiderStack"
          component={RiderStack}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

const RiderStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FBC635",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: "#000000",
      }}
    >
      <Stack.Screen
        name="RiderDrawer"
        component={RiderDrawerNavigation}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Nearby Customer" component={NearbyCustomerScreen} />
      <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
      <Stack.Screen name="InTransit" component={InTransit} />
      <Stack.Screen name="Current Location" component={Map} />
      <Stack.Screen name="Tracking Customer" component={TrackingCustomer} />
      <Stack.Screen name="Rider Feedback" component={SubmitFeedback_R} />
      <Stack.Screen
        name="Tracking Destination"
        component={TrackingDestination}
      />
      
      <Stack.Screen name="Finish" component={FinishRide} />
      <Stack.Screen name="Booked Location" component={BookedMap} />
      <Stack.Screen
        name="CustomerStack"
        component={CustomerStack}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const RootStack = () => {
  const { isAuthenticated, userRole, loading, checkToken } = useAuth();
  const [initialLoading, setInitialLoading] = React.useState(true);

  React.useEffect(() => {
    const validateToken = async () => {
      await checkToken(); // Validate token on app start
      setInitialLoading(false); // Set loading to false after validation
    };
    validateToken();
  }, [checkToken]);

  if (initialLoading || loading) {
    // Show a loading screen while validating token
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FBC635' }}>
        <ActivityIndicator size="large" color="#000000" />
      </SafeAreaView>
    );
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
    <SafeAreaProvider>
      <StatusBar backgroundColor="#FBC635" barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FBC635' }}>
        <NavigationContainer ref={navigationRef}>
          <RootStack />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Navigation;
