import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  RefreshControl,
  Alert,
  Modal,
  LayoutAnimation,
  UIManager,
  Platform
} from "react-native";
import FindingCustomerSpinner from "../spinner/FindingCustomerSpinner";
import NearbyCustomersMap from "./NearbyCustomersMap";
import userService from "../../services/auth&services";
import Pusher from "pusher-js/react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from "../../services/api_url";
import { useAuth } from "../../services/useAuth";

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const NearbyCustomerScreen = ({ navigation }) => {
  const [showSpinner, setShowSpinner] = useState(true);
  const [availableRides, setAvailableRides] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [matchedRide, setMatchedRide] = useState(null);
  const [applyRide, setApplyRide] = useState(null);
  const [user_id, setUser_id] = useState();
  const { token } = useAuth();
  const pusher = new Pusher('1b95c94058a5463b0b08', {
    cluster: 'ap1',
    forceTLS: true,
    encrypted: true,
    authEndpoint: API_URL + 'broadcasting/auth',
    auth: {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    },
  });

  const fetchAvailableRides = useCallback(async () => {
    try {
      const response = await userService.getAvailableRides();
      const id = await userService.fetchRider();
      setUser_id(id.user_id);

      const sortedRides = response.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setAvailableRides(sortedRides);
    } catch (error) {
      console.error("Failed to fetch available rides:", error);
      Alert.alert("Error", "Failed to fetch available rides. Please try again.");
    } finally {
      setShowSpinner(false);
    }
  }, []);

  useEffect(() => {
    const setupPusher = async () => {
      try {
        if (!user_id) return;

        const ridesChannel = pusher.subscribe('rides');
        const appliedChannel = pusher.subscribe(`private-rider.${user_id}`);

        ridesChannel.bind('RIDES_UPDATE', data => {
          if (data && Array.isArray(data.rides)) {
            const sortedRides = data.rides.sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setAvailableRides(sortedRides);
          }
        });

        appliedChannel.bind('ride.apply', data => {
          if (data && data.applicationData) {
            setApplyRide(data.applicationData);
            setShowApplyModal(true);
          }
        });

        return () => {
          appliedChannel.unbind_all();
          pusher.unsubscribe(`private-rider.${user_id}`);
          pusher.unsubscribe('rides');
        };
      } catch (error) {
        console.error('Error setting up Pusher:', error);
      }
    };

    setupPusher();
    fetchAvailableRides();
  }, [user_id]);

  const closeModal = () => {
    setShowModal(false);
    setMatchedRide(null);
  };

  const closeApplyModal = () => {
    setShowApplyModal(false);
    setApplyRide(null);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setShowSpinner(true);
    await fetchAvailableRides();
    setRefreshing(false);
  }, [fetchAvailableRides]);

  const handleDetailsButtonPress = (ride) => {
    navigation.navigate("BookingDetails", { ride });
  };

  const handleShowMap = () => {
    if (availableRides.length > 0) {
      setShowMap(true);
    } else {
      console.warn("No available rides to show on the map.");
    }
  };

  return (
    <>
      {showMap && (
        <NearbyCustomersMap
          availableRides={availableRides}
          onClose={() => setShowMap(false)}
          navigation={navigation}
        />
      )}
      
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ImageBackground
          source={require("../../pictures/13.png")}
          style={styles.background}
        >
          {showSpinner && (
            <View style={styles.spinnerContainer}>
              <FindingCustomerSpinner />
            </View>
          )}
          
          {!showSpinner && (
            <TouchableOpacity
              style={styles.mapButton}
              onPress={handleShowMap}
            >
              <Text style={styles.mapButtonText}>Show in Map</Text>
            </TouchableOpacity>
          )}

          {!showSpinner && availableRides.length === 0 && (
            <View style={styles.noRidesContainer}>
              <Text style={styles.noRidesText}>No rides available at the moment.</Text>
            </View>
          )}
          
          <ScrollView contentContainerStyle={styles.container}>
            {availableRides.map((ride, index) => (
              <View key={ride.ride_id || `ride-${index}`} style={styles.customerCard}>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerText}>
                    Name: {`${ride.first_name} ${ride.last_name}`}
                  </Text>
                  <Text style={styles.customerText}>Pickup: {ride.ride_type}</Text>
                </View>
                <TouchableOpacity
                   style={styles.detailsButton}
                   onPress={() => handleDetailsButtonPress(ride)}
                >
                  <Text style={styles.detailsButtonText}>
                    Details
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          {applyRide && (
            <Modal 
              visible={showApplyModal} 
              transparent={true} 
              animationType="slide"
              onRequestClose={closeApplyModal}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>New Ride Application!</Text>
                  <Text style={styles.modalText}>Application ID: {applyRide.apply_id}</Text>
                  <Text style={styles.modalText}>Status: {applyRide.status}</Text>
                  <Text style={styles.modalText}>Date: {new Date(applyRide.date).toLocaleString()}</Text>
                  
                  {/* {applyRide.ride_details && (
                    <View style={styles.rideDetails}>
                      <Text style={styles.sectionTitle}>Ride Details:</Text>
                      <Text style={styles.modalText}>Pickup: {applyRide.ride_details.pickup_location}</Text>
                      <Text style={styles.modalText}>Dropoff: {applyRide.ride_details.dropoff_location}</Text>
                      <Text style={styles.modalText}>Date: {new Date(applyRide.ride_details.ride_date).toLocaleString()}</Text>
                      <Text style={styles.modalText}>Fare: ${applyRide.ride_details.fare}</Text>
                    </View>
                  )} */}
                  
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => {
                        closeApplyModal();
                      }}
                    >
                      <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.declineButton]}
                      onPress={closeApplyModal}
                    >
                      <Text style={styles.buttonText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          )}
        </ImageBackground>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    opacity: 0.8,
    backgroundColor: "#FFD700",
  },
  container: {
    margin: 10,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  customerCard: {
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  customerText: {
    fontSize: 16,
    color: "#000",
  },
  detailsButton: {
    backgroundColor: "#32CD32",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  detailsButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  mapButton: {
    alignSelf: "center",
    backgroundColor: "#FFD700",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  mapButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  noRidesContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  noRidesText: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginVertical: 5,
  },
  rideDetails: {
    marginTop: 10,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  acceptButton: {
    backgroundColor: "#32CD32",
  },
  declineButton: {
    backgroundColor: "#FF6347",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default NearbyCustomerScreen;
