import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import FindingCustomerSpinner from "../spinner/FindingCustomerSpinner";

const NearbyCustomerScreen = ({ navigation }) => {
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    // Set a timeout to hide the spinner after 2 seconds
    const timer = setTimeout(() => {
      setShowSpinner(false);
    }, 2000);

    // Clear the timeout if the component is unmounted
    return () => clearTimeout(timer);
  }, []);

  const customers = [
    {
      name: "Ibarra, Ray Anthony",
      pickup: "Ibarra",
      dropoff: "USTP",
      offer: 100,
    },
    {
      name: "Buwanding, Aladdin",
      pickup: "Singapore",
      dropoff: "USTP",
      offer: 70,
    },
    {
      name: "Ratunil, John Carlo",
      pickup: "Singapore",
      dropoff: "USTP",
      offer: 40,
    },
    {
      name: "Juaton, Mark Jundy",
      pickup: "Singapore",
      dropoff: "USTP",
      offer: 120,
    },
  ];

  const handleDetailsButtonPress = () => {
    console.log("Details button pressed");
    navigation.navigate("BookingDetails");
  };

  return (
    <ImageBackground
      source={{ uri: "https://your-map-image-url.com" }} // Replace with your map image URL or local asset
      style={styles.background}
    >
      {showSpinner && (
        <View style={styles.spinnerContainer} pointerEvents="none">
          <FindingCustomerSpinner />
        </View>
      )}
      <ScrollView contentContainerStyle={styles.container}>
        {customers.map((customer, index) => (
          <View key={index} style={styles.customerCard}>
            <View style={styles.customerInfo}>
              <Text style={styles.customerText}>Name: {customer.name}</Text>
              <Text style={styles.customerText}>Pickup: {customer.pickup}</Text>
              <Text style={styles.customerText}>
                Drop-off: {customer.dropoff}
              </Text>
              <Text style={styles.customerText}>Offer: {customer.offer}</Text>
            </View>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={handleDetailsButtonPress}
            >
              <Text style={styles.detailsButtonText}>
                Click for more details
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    margin: 10,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  customerCard: {
    backgroundColor: "#FFC107",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerInfo: {
    flex: 1,
  },
  customerText: {
    color: "#000",
    marginBottom: 5,
  },
  detailsButton: {
    backgroundColor: "#000",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  detailsButtonText: {
    color: "#FFF",
    fontSize: 12,
  },
  spinnerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 999,
  },
});

export default NearbyCustomerScreen;
