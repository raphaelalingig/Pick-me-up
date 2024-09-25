import { StyleSheet, TouchableOpacity, View, ImageBackground } from "react-native";
import React from "react";
import { TextInput, Text } from "react-native-paper";

const InTransit = ({ navigation }) => {
  return (
    <ImageBackground
      source={{ uri: "https://your-map-image-url.com" }} // Replace with your map image URL
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.acceptButtonText}>Rider has arrived. Now in transit. Please do not use your phone!</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => navigation.navigate("Submit Report")}
            >
              <Text style={styles.acceptButtonText}>Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default InTransit;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Slight white overlay for better readability
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    padding: 20,
    backgroundColor: "#FFC533",
    borderRadius: 10,
    width: "90%",
    elevation: 5,
  },
  textinput: {
    backgroundColor: "white",
    width: "100%",
  },
  messageInput: {
    backgroundColor: "white",
    height: 100,
  },
  inputContainer: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  buttonContainer: {
    justifyContent: "flex-end",
    flexDirection: "row",
    marginTop: 20,
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
});
