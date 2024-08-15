import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Button } from "react-native-paper";

const DeliveryConfirmationScreen = ({navigation}) => {
  return (
    <ImageBackground
      source={{ uri: "https://your-map-image-url.com" }} // Replace with your map image URL or local asset
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Delivery</Text>
        <View style={styles.messageContainer}>
          <Text style={styles.successMessage}>Ride Successfully Booked</Text>
          <Text style={styles.statusMessage}>Rider is on the way...</Text>
          <Text style={styles.subTitle}>Rider Details</Text>
          <Text style={styles.detailText}>Martzel Amalberrt Arroyo</Text>
          <Text style={styles.detailText}>0978-345-1234</Text>
          <Text style={styles.detailText}>Motor: Yamaha Sniper 150</Text>
        </View>
        <View>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Button style={styles.returnHomeButton}>
              <Text style={{ color: "white" }}>Return Home</Text>
            </Button>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  header: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
  },
  menuButton: {
    padding: 10,
  },
  menuButtonText: {
    fontSize: 24,
  },
  container: {
    backgroundColor: "#FFD700",
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  messageContainer: {
    alignItems: "center",
  },
  successMessage: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  statusMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 5,
  },
  returnHomeButton: {
    marginTop: 20,
    backgroundColor: "#140F1F",
    borderRadius: 5,
    justifyContent: "flex-end",
  },
});

export default DeliveryConfirmationScreen;
