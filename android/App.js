import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Login from "./src/forms/Login";
import { PaperProvider } from "react-native-paper";
import Navigation from "./src/navigation/Navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import "react-native-gesture-handler";
import { AuthProvider } from "./src/services/AuthContext";
import { RiderProvider } from "./src/context/riderContext";
import { CustomerProvider } from "./src/context/customerContext";
import Pusher from 'pusher-js';
import userService from "./src/services/auth&services";


// Initialize Pusher with your app key and cluster
const pusher = new Pusher('1b95c94058a5463b0b08', {
  cluster: 'ap1', // Replace with your Pusher cluster
});

export default function App() {

  const userId = userService.getUserId();
  useEffect(() => {
    // Subscribe to the channel you want to listen to
    const channel = pusher.subscribe('rides');

    // Listen for the "ride.booked" event
    channel.bind('ride.booked', (data) => {
      console.log('Ride booked event received:', data);
      
      // Display a notification or handle the event data
      Alert.alert(
        'New Ride Booked!',
        `Pickup: ${data.pickup_location} to Dropoff: ${data.dropoff_location}`
      );

      // Update state, notify user, or navigate as needed
    });

    // Unsubscribe when the component is unmounted
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  return (
    <AuthProvider>
      <PaperProvider style={styles.container}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
          <RiderProvider>
            <CustomerProvider>
              <Navigation />
            </CustomerProvider>
          </RiderProvider>
        </SafeAreaView>
      </PaperProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
