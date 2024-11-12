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
import Toast from 'react-native-root-toast';
import FindingCustomerSpinner from "../spinner/FindingCustomerSpinner";
import NearbyCustomersMap from "./NearbyCustomersMap";
import userService from "../../services/auth&services";
import usePusher from "../../services/pusher";
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
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [matchedRide, setMatchedRide] = useState(null);
  const [applyRide, setApplyRide] = useState(null);
  const [user_id, setUser_id] = useState();
  const [rider, setRider] = useState();
  const { userId } = useAuth();

  const pusher = usePusher();

  // useEffect(() => {
  //   const fetchUserId = async () => {
  //     try {
  //       const response = await userService.getUserId();
  //       const id = parseInt(response, 10);
  //       console.log("Fetched user_id:", id);
  //       setUserId(id);
  //     } catch (error) {
  //       console.error("Error fetching user_id:", error);
  //     }
  //   };

  //   fetchUserId();
  // }, []);

    const fetchAvailableRides = useCallback(async () => {
    try {
      setShowSpinner(true);
      const response = await userService.getAvailableRides();
      const id = await userService.fetchRider();

      setRider(id);
      setUser_id(id.user_id);
      console.log("IDASHDIHAD",userId);

      const appResponse = await userService.getApplications(id.user_id);
      console.log(appResponse);

      if (appResponse.data && appResponse.data.length > 0) {
        const firstApplication = appResponse.data[0];
        console.log("Application data:", appResponse.data);
        setApplyRide(firstApplication);
        setShowApplyModal(true);
      }

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
        // if (!userId) return;

        const ridesChannel = pusher.subscribe('rides');
        const appliedChannel = pusher.subscribe('application');
        const bookedChannel = pusher.subscribe('booked');

        ridesChannel.bind('RIDES_UPDATE', data => {
          if (data && Array.isArray(data.rides)) {
            const sortedRides = data.rides.sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setAvailableRides(sortedRides);
          }
        });

        appliedChannel.bind('RIDES_APPLY', data => {
          console.log("Data received:", data);
          if (data && data.applicationData && data.applicationData.length > 0) {
            const apply = data.applicationData[0];
            console.log("Applying user ID check", apply.apply_to, user_id);
            if (apply.apply_to === user_id) {
              setApplyRide(apply);
              setShowApplyModal(true);
              console.log("Modal should now be visible");
            }
          }
        });

        bookedChannel.bind('BOOKED', data => {
          console.log("MATCHED DATA received:", data);
          console.log(user_id)
          console.log("APPLIER", data.ride.applier)
            if (data.ride.applier === user_id) {
              Alert.alert("Ride Match", 'You have found a Match!');
              navigation.navigate("Home");
            }
        });

        return () => {
          appliedChannel.unbind_all();
          pusher.unsubscribe('application');
          pusher.unsubscribe('rides');
          pusher.unsubscribe('booked');
        };
      } catch (error) {
        console.error('Error setting up Pusher:', error);
      }
    };

    setupPusher();
  }, [user_id]);

  const handleDecline = async () => {
    try {
      // setShowSpinner(true);

      const apply_id = applyRide.apply_id;
      const response = await userService.decline_ride(apply_id);

      if (response.data.message == "Declined"){
        Toast.show('Declined Ride Successfully', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          hideOnPress: true,
          backgroundColor: '#333',
          textColor: '#fff'
        });
        setShowApplyModal(false);
        setApplyRide(null);

      }else if (response.data.message == "Unavailable"){
        Toast.show('Ride no longer available', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          hideOnPress: true,
          backgroundColor: '#333',
          textColor: '#fff'
        });
        setShowApplyModal(false);
        setApplyRide(null);
      }


    } catch (error) {
      console.error("Failed to decline ride:", error);
      Alert.alert("Error", "Failed to decline ride. Please try again.");
    } finally {
      // setShowSpinner(false);
    }
  };

  const handleCancelConfirmation = useCallback(() => {
    Alert.alert(
      "Decline Ride",
      "Are you sure you want to decline this ride?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: handleDecline,
          style: "destructive",
        },
      ]
    );
  }, [handleDecline]);

  const closeApplyModal = () => {
    setShowApplyModal(false);
    setApplyRide(null);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAvailableRides();
      setShowApplyModal(false); // Reset modal visibility
      setShowMatchModal(false); // Reset modal visibility
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAvailableRides();
    setRefreshing(false);
  }, []);

  const handleShowMap = () => {
    if (availableRides.length > 0) {
      setShowMap(true);
    } else {
      Toast.show('No available rides to show on the map.', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        backgroundColor: '#333',
        textColor: '#fff'
      });
    }
  };

  const handleViewButton = () => {
    setShowApplyModal(false);
    navigation.navigate("BookingDetails", { ride: applyRide })
  }

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
          {showSpinner ? (
            <View style={styles.spinnerContainer}>
              <FindingCustomerSpinner />
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.mapButton}
                onPress={handleShowMap}
              >
                <Text style={styles.mapButtonText}>Show in Map</Text>
              </TouchableOpacity>

              {availableRides.length === 0 ? (
                <View style={styles.noRidesContainer}>
                  <Text style={styles.noRidesText}>No rides available at the moment.</Text>
                </View>
              ) : (
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
                        onPress={() => navigation.navigate("BookingDetails", { ride })}
                      >
                        <Text style={styles.detailsButtonText}>Details</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </>
          )}

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
                  <Text style={styles.modalText}>Passenger: {applyRide.applier_name}</Text>
                  <Text style={styles.modalText}>Calculated Fare: {applyRide.calculated_fare}</Text>
                  <Text style={styles.modalText}>Offered Fare: {applyRide.fare}</Text>
                  <Text style={styles.modalText}>Date: {new Date(applyRide.ride_date).toLocaleString()}</Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={handleViewButton}
                    >
                      <Text style={styles.buttonText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.declineButton]}
                      onPress={handleCancelConfirmation}
                    >
                      <Text style={styles.buttonText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          )}


          {/* {matchedRide && (
            <Modal 
              visible={showMatchModal} 
              transparent={true} 
              animationType="slide"
              onRequestClose={closeModal}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Ride Match!</Text>
                  <Text style={styles.modalText}>Passenger: {matchedRide.applier_name}</Text>
                  <Text style={styles.modalText}>Calculated Fare: {matchedRide.calculated_fare}</Text>
                  <Text style={styles.modalText}>Offered Fare: {matchedRide.fare}</Text>
                  <Text style={styles.modalText}>Date: {new Date(matchedRide.ride_date).toLocaleString()}</Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleApply(applyRide)}
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
          )} */}


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
    padding: 10,
    alignItems: "center",
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  customerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    width: "90%",
  },
  customerText: {
    fontSize: 16,
    color: "#333",
  },
  detailsButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  detailsButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  mapButton: {
    backgroundColor: "#0096FF",
    padding: 10,
    margin: 15,
    borderRadius: 10,
    alignSelf: "center",
  },
  mapButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  noRidesContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  noRidesText: {
    fontSize: 16,
    color: "#555",
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
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
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
    marginTop: 15,
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  declineButton: {
    backgroundColor: "#FF5252",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default NearbyCustomerScreen;
