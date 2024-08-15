import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

const MotorTaxiOptionScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={{ uri: "https://your-map-image-url.com" }} // Replace with your map image URL or local asset
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Motor-Taxi</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Pick me up from"
            // Add onChangeText functionality
          />
          <TextInput
            style={styles.input}
            placeholder="Destination"
            // Add onChangeText functionality
          />
        </View>
        <TouchableOpacity style={styles.locationButton}>
          <Text style={styles.locationButtonText}>Use current location</Text>
        </TouchableOpacity>
        <View style={styles.fareContainer}>
          <Text style={styles.fareLabel}>Fare :</Text>
          <TextInput
            style={styles.fareInput}
            placeholder="50.00"
            keyboardType="numeric"
            // Add onChangeText functionality
          />
          <Text style={styles.fareHint}>Edit fare to desired amount</Text>
        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.cancelButton}>
            <Text
              style={styles.cancelButtonText}
              onPress={() => navigation.goBack()}
            >
              CANCEL
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
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
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  locationButton: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  fareContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  fareLabel: {
    fontSize: 16,
  },
  fareInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "50%",
    textAlign: "center",
  },
  fareHint: {
    fontSize: 12,
    color: "#555",
    marginTop: 5,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "#00FF00",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MotorTaxiOptionScreen;
