import React, { useState, useEffect, useContext } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Text } from "react-native-paper";
import { CustomerContext } from "../../context/customerContext";
import * as Location from "expo-location";
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'; // For icons

const BookNow = ({ setCurrentForm, navigation }) => (
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
      <View>
        <Text
          style={{ textDecorationLine: "underline", color: "#FBC635", marginTop: 10, textAlign: 'center' }}
          onPress={() => navigation.navigate("Location")}
        >
          View Location
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
          <TouchableOpacity
            style={[
              styles.serviceButton,
              selectedService === "Delivery" && styles.selectedButton,
            ]}
            onPress={() => handleServiceSelect("Delivery")}
          >
            <MaterialCommunityIcons name="bike" size={24} color="black" />
            <Text
              style={[
                styles.serviceButtonText,
                selectedService === "Delivery" && { color: "black" },
              ]}
            >
              Delivery
            </Text>
            <Text style={styles.serviceDescription}>
              We deliver what you need
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.serviceButton,
              selectedService === "Pakyaw" && styles.selectedButton,
            ]}
            onPress={() => handleServiceSelect("Pakyaw")}
          >
            <FontAwesome5 name="users" size={24} color="black" />
            <Text
              style={[
                styles.serviceButtonText,
                selectedService === "Pakyaw" && { color: "black" },
              ]}
            >
              Pakyaw
            </Text>
            <Text style={styles.serviceDescription}>
              Ride with friend & family
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.serviceButton,
              selectedService === "Motor Taxi" && styles.selectedButton,
            ]}
            onPress={() => handleServiceSelect("Motor Taxi")}
          >
            <MaterialCommunityIcons name="motorbike" size={24} color="black" />
            <Text
              style={[
                styles.serviceButtonText,
                selectedService === "Motor Taxi" && { color: "black" },
              ]}
            >
              Motor-Taxi
            </Text>
            <Text style={styles.serviceDescription}>
              Bring you where ever you want
            </Text>
          </TouchableOpacity>
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
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const { customerCoords, setCustomerCoords } = useContext(CustomerContext);

  useEffect(() => {
    const getLocation = async () => {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setLoading(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        setCustomerCoords({
          accuracy: location.coords.accuracy,
          longitude: location.coords.longitude,
          latitude: location.coords.latitude,
          altitude: location.coords.altitude,
          altitudeAccuracy: location.coords.altitudeAccuracy,
          timestamp: location.timestamp,
        });
      } catch (error) {
        setErrorMsg("Error fetching location");
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, [setCustomerCoords]);

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={{ flex: 1 }}>
      {currentForm === "BookNow" ? (
        <BookNow setCurrentForm={setCurrentForm} navigation={navigation} />
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
    justifyContent: "space-evenly",
  },
  container: {
    backgroundColor: "#FFD700",
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttonContainer: {
    justifyContent: "space-around",
    marginBottom: 20,
  },
  serviceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "transparent",
  },
  serviceButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  serviceDescription: {
    fontSize: 12,
    marginLeft: 15,
    color: "#555",
  },
  selectedButton: {
    borderColor: "black",
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
    backgroundColor: "#008000",
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
