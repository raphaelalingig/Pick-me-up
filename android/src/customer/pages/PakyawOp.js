import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

const PakyawOptionScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={{ uri: "https://your-map-image-url.com" }} // Replace with your map image URL or local asset
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Pakyaw</Text>
        <TextInput
          style={styles.input}
          placeholder="How many riders"
          keyboardType="numeric"
          // Add onChangeText functionality
        />
        <TextInput
          style={styles.input}
          placeholder="Hours of use"
          keyboardType="numeric"
          // Add onChangeText functionality
        />
        <TextInput
          style={styles.input}
          placeholder="Pick up destination"
          // Add onChangeText functionality
        />
        <TextInput
          style={styles.input}
          placeholder="Offer Amount"
          keyboardType="numeric"
          // Add onChangeText functionality
        />
        <Text style={styles.note}>
          The higher the amount offered the fastest the transaction
        </Text>
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.cancelButton}>
            <Text
              style={styles.cancelButtonText}
              onPress={() => navigation.goBack()}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => navigation.navigate("Tracking Rider")}
          >
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
    elevation: 5, // For Android shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
  },
  note: {
    fontSize: 12,
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
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
    backgroundColor: "#008000",
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

export default PakyawOptionScreen;
