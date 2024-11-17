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
import { PusherProvider } from "./src/context/PusherContext";
import userService from "./src/services/auth&services";
import { useAuth } from "./src/services/useAuth";


export default function App() {
  

  const userId = userService.getUserId();
  console.log("APP JS ID:", userId)

  return (
    <AuthProvider>
      <PusherProvider userId={userId}>  
        <PaperProvider style={styles.container}>
          <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
          
            <RiderProvider>
              <CustomerProvider>
                <Navigation />
              </CustomerProvider>
            </RiderProvider>
         
          </SafeAreaView>
        </PaperProvider>
      </PusherProvider>
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
