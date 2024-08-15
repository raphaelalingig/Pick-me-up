import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Text } from "react-native-paper";

const BookNow = ({ setCurrentForm }) => (
  <View style={styles.contentContainer}>
    <View style={styles.titleContainer}>
      <Text variant="titleLarge" style={styles.titleText}>
        PICKME UP
      </Text>
      <Text
        variant="titleSmall"
        style={{ color: "#FBC635", textAlign: "center" }}
      >
        Pick you up wherever you are.
      </Text>
    </View>

    <TouchableOpacity onPress={() => setCurrentForm("ChooseServiceScreen")}>
      <View style={{ padding: 15, backgroundColor: "black", borderRadius: 10 }}>
        <Text variant="titleMedium" style={styles.titleText}>
          Book Now
        </Text>
      </View>
    </TouchableOpacity>
  </View>
);

const ChooseServiceScreen = ({ setCurrentForm, navigation }) => {
  const [selectedService, setSelectedService] = useState(null);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleBookPress = () => {
    if (selectedService) {
      navigation.navigate(selectedService); // Navigate to the selected service screen
    }
  };

  return (
    <ImageBackground
      source={{ uri: "https://your-map-image-url.com" }} // Replace with your map image URL or local asset
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>CHOOSE RIDER SERVICES</Text>
        <View style={styles.buttonContainer}>
          {["Delivery", "Pakyaw", "Motor Taxi"].map((service) => (
            <TouchableOpacity
              key={service}
              style={[
                styles.serviceButton,
                selectedService === service && styles.selectedButton, // Apply selected style
              ]}
              onPress={() => handleServiceSelect(service)}
            >
              <Text
                style={[
                  styles.serviceButtonText,
                  selectedService === service && { color: "black" }, // Change text color on selection
                ]}
              >
                {service}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setCurrentForm("BookNow")}
          >
            <Text style={styles.cancelButtonText}>CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bookButton} onPress={handleBookPress}>
            <Text style={styles.bookButtonText}>BOOK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const MainComponent = ({ navigation }) => {
  const [currentForm, setCurrentForm] = useState("BookNow");

  return (
    <View style={{ flex: 1 }}>
      {currentForm === "BookNow" ? (
        <BookNow setCurrentForm={setCurrentForm} />
      ) : (
        <ChooseServiceScreen
          setCurrentForm={setCurrentForm}
          navigation={navigation}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    padding: 20,
    backgroundColor: "black",
    borderRadius: 10,
  },
  contentContainer: {
    justifyContent: "space-around",
    alignItems: "center",
    height: "100%",
  },
  titleText: {
    fontWeight: "bold",
    color: "#FBC635",
    textAlign: "center",
  },
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  serviceButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "transparent", // Default border color
  },
  serviceButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedButton: {
    borderColor: "black", // Black border when selected
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
  bookButton: {
    backgroundColor: "#00FF00",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MainComponent;
