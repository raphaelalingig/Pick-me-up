import React, { useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Button } from "react-native-paper";

const BookingDetailsScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={{ uri: "https://your-map-image-url.com" }} // Replace with your map image URL or local asset
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Booking Details</Text>
        <View style={styles.inputContainer}>
          <Text>Name:</Text>
          <TextInput
            style={styles.input}
            value="Ibarra, Ray Anthony"
            editable={false}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text>Location:</Text>
          <TextInput style={styles.input} value="Bulua" editable={false} />
        </View>
        <View style={styles.inputContainer}>
          <Text>Service:</Text>
          <TextInput style={styles.input} value="Motor-Taxi" editable={false} />
        </View>
        <View style={styles.inputContainer}>
          <Text>Drop off:</Text>
          <TextInput style={styles.input} value="USTP" editable={false} />
        </View>
        <View style={styles.inputContainer}>
          <Text>Fee:</Text>
          <TextInput style={styles.input} value="100" editable={false} />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => navigation.navigate("Booked Location")}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
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
  inputContainer: {
    width: "100%",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#FFF",
  },
  acceptButton: {
    backgroundColor: "#158D01",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  acceptButtonText: {
    color: "#FFF",
  },
  viewLocationButtonText: {
    color: "black",
    padding: 5,
    textDecorationLine: "underline",
    border: 2,
  },
});

export default BookingDetailsScreen;
