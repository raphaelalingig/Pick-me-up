import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ScrollView,
  RefreshControl,
  Dimensions
} from "react-native";
import { Button } from "react-native-paper";
import userService from '../../services/auth&services';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'; // For icons

const { height, width } = Dimensions.get('window'); // Get screen dimensions

const DeliveryConfirmationScreen = ({navigation}) => {
  const [bookDetails, setBookDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  const fetchLatestAvailableRide = async () => {
    try {
      const ride = await userService.checkActiveBook();
      setBookDetails(ride.rideDetails);
    } catch (error) {
      Alert.alert("Error", "Failed to retrieve the latest available ride.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestAvailableRide();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Navigate to Home screen
    navigation.navigate("Home");
    setRefreshing(false);
  }, [navigation]);

  const handleCancel = async () => {
    
    console.log("Attempting to cancel ride");
    
    setIsLoading(true);
    try {
      const response = await userService.cancel_ride(bookDetails.ride_id);
      console.log("Cancel ride response:", response.data);
  
      if (response.data && response.data.message) {
        Alert.alert("Success", response.data.message);
        navigation.navigate("Home"); // Redirect to home screen or wherever appropriate
      } else {
        Alert.alert("Error", "Failed to cancel the ride. Please try again.");
      }
    } catch (error) {
      console.error("Failed to Cancel Ride", error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 400) {
        Alert.alert("Error", error.response.data.error || "This ride is no longer available.");
        navigation.goBack(); // Go back to the previous screen
      } else {
        Alert.alert("Error", "An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  if (isLoading || !bookDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView
    contentContainerStyle={styles.scrollViewContent}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }
    >
      <View style={styles.container}>
        {/* Header Section covering 20% */}
        <View style={styles.header}>
          <FontAwesome5 name="users" size={40} color="black" />
          <Text style={styles.serviceTitle}>{bookDetails.ride_type}</Text>
        </View>

        {/* Content Section covering 80% */}
        <View style={styles.content}>
          {/* Booking Confirmation Message */}
          <View style={styles.messageContainer}>
            <View style={styles.successBox}>
              <MaterialCommunityIcons name="motorbike" size={80} color="black" />
              <View style={styles.successTextContainer}>
                <Text style={styles.successMessage}>Matched Successfully</Text>
                <Text style={styles.statusMessage}>Rider is on the way...</Text>
              </View>
            </View>
          </View>

          {/* Rider Details Section */}
          <View style={styles.detailsContainer}>
            <Text style={styles.subTitle}>Rider Details</Text>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="account" size={24} color="black" />
              <Text style={styles.detailText}>{bookDetails.rider ? `${bookDetails.rider.first_name} ${bookDetails.rider.last_name}` : 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="phone" size={24} color="black" />
              <Text style={styles.detailText}>{bookDetails.rider ? `${bookDetails.rider.mobile_number}` : 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="motorbike" size={24} color="black" />
              <Text style={styles.detailText}>Motor: Yamaha Sniper 150</Text>
            </View>
          </View>

          {/* Go Back Button */}
          <TouchableOpacity>
            <View style={styles.goBackButton}>
              <Text style={styles.goBackButtonText}>Contact Rider</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleCancel}>
            <View style={styles.goBackButton}>
              <Text style={styles.goBackButtonText}>Cancel</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffd700", // Yellow background color
  },
  header: {
    flex: 2, // 20% of the screen height
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#ffd700", // Yellow background for the header
    flexDirection: "row",
  },
  serviceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#FFF",
    textDecorationLine: 'underline',
  },
  content: {
    flex: 8, // 80% of the screen height
    backgroundColor: "#f5f5f5", // Background color for content section
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  messageContainer: {
    paddingTop: 50,
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
    marginLeft: 0,
    padding: 30,
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
    padding: 30,
    borderRadius: 10,
    width: "100%",
    marginBottom: 20,
    elevation: 2,
  },
  subTitle: {
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
    marginTop: 20,
  },
  goBackButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DeliveryConfirmationScreen;