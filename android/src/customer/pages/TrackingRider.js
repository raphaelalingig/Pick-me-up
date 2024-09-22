import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'; // For icons
import { Button } from "react-native-paper";

// Pa help dari nga ang pakyaw nga title kay maalisdan kung unsa nga service ki kuha sa customer
const DeliveryConfirmationScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      {/* Service Title Section */}
      <View style={styles.header}>
        <FontAwesome5 name="users" size={40} color="black" />
        <Text style={styles.serviceTitle}>Pakyaw</Text>
      </View>

      {/* Booking Confirmation Message */}
      <View style={styles.messageContainer}>
        <View style={styles.successBox}>
          <MaterialCommunityIcons name="motorbike" size={32} color="black" />
          <View style={styles.successTextContainer}>
            <Text style={styles.successMessage}>Ride Successfully Booked</Text>
            <Text style={styles.statusMessage}>Rider is on the way...</Text>
          </View>
        </View>
      </View>

      {/* Rider Details Section */}
      <View style={styles.detailsContainer}>
        <Text style={styles.subTitle}>Rider Details</Text>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account" size={24} color="black" />
          <Text style={styles.detailText}>Martzel Amalberrt Arroyo</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="phone" size={24} color="black" />
          <Text style={styles.detailText}>0978-345-1234</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="motorbike" size={24} color="black" />
          <Text style={styles.detailText}>Motor: Yamaha Sniper 150</Text>
        </View>
      </View>

      {/* Go Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={styles.goBackButton}>
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffd700", // Yellow background color
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  serviceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#FFF",
    textDecorationLine: 'underline',
  },
  messageContainer: {
    width: "100%",
    marginBottom: 20,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  successTextContainer: {
    marginLeft: 10,
  },
  successMessage: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusMessage: {
    fontSize: 14,
    color: "gray",
  },
  detailsContainer: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginBottom: 20,
    elevation: 2,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    marginLeft: 10,
  },
  goBackButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  goBackButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DeliveryConfirmationScreen;
