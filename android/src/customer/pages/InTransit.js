import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Button } from "react-native-paper";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';  // Importing icons
import userService from '../../services/auth&services';

const Intransit = ({ navigation }) => {
  const [bookDetails, setBookDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLatestRide = async () => {
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
    fetchLatestRide();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    navigation.navigate("Home");
    setRefreshing(false);
  }, [navigation]);
  
  if (isLoading || !bookDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
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
      
      {/* Header with menu icon */}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="menu"
          size={30}
          color="#333"
        />
      </View>

      {/* Ride Type Section */}
      <View style={styles.rideTypeContainer}>
        <View style={styles.rideTypeIconContainer}>
          <MaterialCommunityIcons
            name="motorbike"
            size={40}
            color="#333" // Icon color
          />
        </View>
        <Text style={styles.rideTypeText}>MOTOR TAXI</Text>
      </View>

      {/* Image Section */}
      <View style={styles.imagePlaceholder}>
        <Image
          source={require("../../pictures/7.png")} // Replace with your image URL
          style={styles.image}
        />
      </View>

      {/* Message Section */}
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          Let us not use our phone during the ride to avoid unnecessary accident in the road.
        </Text>
      </View>

      {/* Report Button */}
      <TouchableOpacity>
        <Button mode="contained" style={styles.reportButton}>
          REPORT
        </Button>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  // Ride type section
  rideTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    justifyContent: 'center',
  },
  rideTypeIconContainer: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    elevation: 2,  // Adds a slight shadow to the icon container
  },
  rideTypeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',  // Yellow color for the title
  },
  // Image placeholder
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#FFD700',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 30,
  },
  image: {
    width: '80%', // Adjust size as needed
    height: '80%', // Adjust size as needed
    borderRadius: 100, // Keep it circular
  },
  // Message section
  messageContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  // Report button
  reportButton: {
    backgroundColor: '#FF0000',  // Red color for the report button
    padding: 10,
    borderRadius: 8,
    elevation: 3,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
  },
});

export default Intransit;
