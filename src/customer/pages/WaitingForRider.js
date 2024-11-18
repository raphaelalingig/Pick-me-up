import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ScrollView,
  RefreshControl,
  Image,
  Modal,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Button, Card, Surface, Chip } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import userService from "../../services/auth&services";
import { BlurView } from "expo-blur";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import riderMarker from "../../../assets/rider.png";
import customerMarker from "../../../assets/customer.png";
import { CustomerContext } from "../../context/customerContext";
import usePusher1 from "../../services/pusher";
import { calculateDistance, formatDistance, sortRidersByDistance, filterRidersByDistance } from "./proximity/util";
import MapWithClustering from './MapWithClustering';

const { width, height } = Dimensions.get('window');

const WaitingRider = ({ navigation }) => {
  const { customerCoords } = useContext(CustomerContext);
  const [region, setRegion] = useState({
    latitude: customerCoords.latitude,
    longitude: customerCoords.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [customerLat, setCustomerLat] = useState(null);
  const [customerLng, setCustomerLng] = useState(null);
  const [bookDetails, setBookDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('details');
  const [modalVisible, setModalVisible] = useState(false);
  const [riderModalVisible, setRiderModalVisible] = useState(false);
  const [riderLocs, setRiderLocations] = useState([]);
  const [selectedRider, setSelectedRider] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("Finding your rider...");
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedRide, setMatchedRide] = useState(null);

  const pusher = usePusher1();

  const fetchLatestRide = useCallback(async () => {
    setIsLoading(true);
    try {
      const ride = await userService.checkActiveBook();
      setBookDetails(ride.rideDetails);
      console.log(ride.rideDetails.customer_latitude)
      setCustomerLat(parseFloat(ride.rideDetails.customer_latitude));
      setCustomerLng(parseFloat(ride.rideDetails.customer_longitude));
      setRegion({
        latitude: parseFloat(ride.rideDetails.customer_latitude),
        longitude: parseFloat(ride.rideDetails.customer_longitude),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setIsLoading(false);
    } catch (error) {
      Alert.alert("Error", "Failed to retrieve the latest available ride.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await userService.getUserId();
        const id = parseInt(response, 10);
        console.log("Fetched user_id:", id);
        setUserId(id);
      } catch (error) {
        console.error("Error fetching user_id:", error);
      }
    };

    fetchUserId();
  }, []);

  const fetchApplications = useCallback(async () => {
    console.log("Ride ID:", bookDetails.ride_id)
    try {
      if (!bookDetails?.ride_id) return;

      const userId = await userService.getUserId();
      if (!userId) {
        console.warn("No user ID available");
        return;
      }
  
      const response = await userService.getRideApplications(bookDetails.ride_id);
      console.log("All applications:", response);
  
      // Filter out applications where the applier_details.user_id matches the current user's ID
      const filteredApplications = response.filter(application => 
        application.applier_details.user_id !== parseInt(userId)
      );
      
      console.log("Current User ID:", userId);
      console.log("Filtered applications:", filteredApplications);
      setApplications(filteredApplications);
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching applications:", error);
      Alert.alert("Error", "Failed to retrieve rider applications.");
    }
  }, [bookDetails]);

  const fetchRiderLocations = async () => {
    try {
      const response = await userService.fetchLoc();
      console.log("OANSNASF:", customerLat, customerLng)
      
      // Filter active riders and calculate distances
      const activeRiders = response.filter(rider => 
        rider.availability === 'Available' &&
        rider.verification_status === 'Verified' &&
        rider.user.status === 'Active'
      );
      
      // Add distance to each rider and sort by proximity
      const ridersWithDistance = sortRidersByDistance(activeRiders, customerLat, customerLng);
      
      // Optional: Filter riders within 10km
      const nearbyRiders = filterRidersByDistance(ridersWithDistance, 10);
      console.log(nearbyRiders)
      
      setRiderLocations(nearbyRiders);
    } catch (error) {
      console.error('Error fetching rider locations:', error);
      Alert.alert('Error', 'Failed to retrieve rider locations. Please try again.');
    }
  };
  
  // Update the useEffect hook that fetches locations
  // useEffect(() => {
  //   const locationInterval = setInterval(fetchRiderLocations, 30000); // Update every 30 seconds
    
  //   // Initial fetch
  //   fetchRiderLocations();
    
  //   // Cleanup
  //   return () => clearInterval(locationInterval);
  // }, []);

  useEffect(() => {
    const setupPusher = async () => {
      try {
        if (!userId) return;
        const bookedChannel = pusher.subscribe('booked');

        bookedChannel.bind('BOOKED', data => {
          console.log("MATCHED DATA received:", data);
          console.log(userId)
          console.log("APPLIER", data.ride.applier)
            if (data.ride.applier === userId) {
              Alert.alert("Ride Match", 'You have found a Match!');
              navigation.navigate("Home");
            }
        });

        return () => {
          appliedChannel.unbind_all();
          pusher.unsubscribe('booked');
        };
      } catch (error) {
        console.error('Error setting up Pusher:', error);
      }
    };

    setupPusher();
    fetchLatestRide();
  }, [userId]);

  // useEffect(() => {
  //   fetchLatestRide();
  //   fetchLoc();
  // }, [fetchLatestRide]);



  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLatestRide()
    fetchRiderLocations().then(() => setRefreshing(false));
  }, [fetchLatestRide]);

  const handleShowNearbyRiders = () => {
    fetchRiderLocations(); // Refresh rider locations
    setModalVisible(true);
  };


  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
  };

  const handleRiderSelect = (rider) => {
    setSelectedRider(rider);
    setRiderModalVisible(true);
  };


  const handleApply = async (bookDetails, selectedRider) => {
    if (!userId) {
      Alert.alert("Error", "User ID is not available.");
      return;
    }
    const ride_id = bookDetails.ride_id;
    const rider = selectedRider.user_id;


    console.log("Attempting to apply rider with ID:", bookDetails.ride_id);
    setIsLoading(true);
    try {
      const response = await userService.apply_rider(ride_id, rider);
      console.log("Accept ride response:", response.data);
      if (response.data.message === "exist") {
        setRiderModalVisible(false);
        Alert.alert("Message", 'You have already applied for this rider.');
      }else if (response.data.message === "applied"){
        Alert.alert("Message", 'Applied Successfully!');
        setRiderModalVisible(false);
      }else if (response.data && response.data.message){
        Alert.alert("Ride Match", 'You have found a Match!');
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", "Failed to accept the ride. Please try again.");
      }
    } catch (error) {
      console.error(
        "Failed to Accept Ride",
        error.response ? error.response.data : error.message
      );
      if (error.response && error.response.status === 404) {
        Alert.alert(
          "Error",
          "Ride or ride location not found. Please try again."
        );
      } else if (error.response && error.response.status === 400) {
        Alert.alert(
          "Error",
          error.response.data.error || "This ride is no longer available."
        );
      } else {
        Alert.alert(
          "Error",
          "An error occurred while getting location or accepting the ride. Please try again."
        );
      }
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  // const isRiderApplied = useCallback((rider) => {
  //   if (!applications || !rider) return false;
    
  //   const riderFullName = `${rider.user.first_name} ${rider.user.last_name}`.toLowerCase();
    
  //   return applications.some(application => {
  //     const applierFullName = `${application.applier_details.first_name} ${application.applier_details.last_name}`.toLowerCase();
  //     return applierFullName === riderFullName;
  //   });
  // }, [applications]);

  const handleCancel = useCallback(async () => {
    if (!bookDetails?.ride_id) return;
    setLoadingMessage("Canceling your ride...");
    setIsLoading(true);
    try {
      const response = await userService.cancel_ride(bookDetails.ride_id);
      if (response.data?.message) {
        Alert.alert("Success", response.data.message, [
          { text: "OK", onPress: () => navigation.navigate("Home") }
        ]);
      } else {
        throw new Error("Cancel failed");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to cancel ride";
      Alert.alert("Error", errorMessage, [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [bookDetails, navigation]);

  const handleCancelConfirmation = useCallback(() => {
    Alert.alert(
      "Cancel Ride",
      "Are you sure you want to cancel this ride?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: handleCancel,
          style: "destructive",
        },
      ]
    );
  }, [handleCancel]);

  const handleMarkerPress = (rider) => {
    setSelectedRider(rider);
    setRiderModalVisible(true);
  };

  const handleCancelModal = () => {
    setRiderModalVisible(false);
  };

  const renderLoadingScreen = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007BFF" />
      <Text style={styles.loadingText}>{loadingMessage}</Text>
    </View>
  );

  const renderRiderInfoModal = () => (
    <Modal
      visible={riderModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setRiderModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {selectedRider && (
            
            <>
              <Text style={styles.modalTitle}>Rider Information</Text>
              <Text style={styles.modalText}>Name: {selectedRider.user.first_name} {selectedRider.user.last_name}</Text>
              <Text style={styles.modalText}>Rating: 4.4 ⭐</Text>
              <Text style={styles.modalText}>Distance: {formatDistance(selectedRider.distance)}</Text>
              <View style={styles.modalButtonContainer}>
                <Button 
                  mode="contained" 
                  onPress={() => handleApply(bookDetails, selectedRider)}
                  style={styles.applyButton}
                >
                  Apply
                </Button>
              <Button 
                mode="outlined" 
                onPress={handleCancelModal} 
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderRideDetailsContent = () => (
    <ImageBackground
      source={require("../../pictures/11.png")}
      style={styles.background}
      blurRadius={5}
    >
      <Surface style={styles.surfaceCard} elevation={4}>
        <View style={styles.rideTypeHeader}>
          <MaterialCommunityIcons name="motorbike" size={30} color="#007BFF" />
          <Text style={styles.rideTypeText}>{bookDetails.ride_type}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color="#4CAF50" />
            <Text style={styles.detailText}>
              From: {bookDetails.pickup_location}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color="#FF5722" />
            <Text style={styles.detailText}>
              To: {bookDetails.dropoff_location}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cash" size={20} color="#FFC107" />
            <Text style={styles.fareText}>Fare: ₱{bookDetails.fare}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Chip 
            icon="eye" 
            onPress={handleShowNearbyRiders} 
            style={styles.chip}
          >
            Nearby Riders
          </Chip>
          <Chip 
            icon="close-circle" 
            onPress={handleCancelConfirmation} 
            style={[styles.chip, styles.cancelChip]}
          >
            Cancel Ride
          </Chip>
        </View>
      </Surface>
    </ImageBackground>
  );

  const renderRidersNearbyModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Nearby Riders</Text>
          
          <ScrollView>
            {riderLocs.length === 0 ? (
              <Text style={styles.noRidersText}>No Nearby Riders Available</Text>
            ) : (
              riderLocs.map((rider, index) => (
                <Card key={index} style={styles.applicationCard}>
                  <Card.Content style={styles.cardContent}>
                    <View style={styles.riderInfoSection}>
                      <Text style={styles.applicantName}>
                        {rider.user.first_name} {rider.user.last_name}
                      </Text>
                      <View style={styles.applicantDetails}>
                        <Text style={styles.detailItem}>Distance: {formatDistance(rider.distance)}</Text>
                        <Text style={styles.detailItem}>Rating: {rider.user.rating} ⭐</Text>
                        <Text style={styles.detailItem}>Status: {rider.availability}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.cardButtonContainer}>
                      <Button
                        mode="contained"
                        onPress={() => {
                          const riderLat = parseFloat(rider.rider_latitude);
                          const riderLng = parseFloat(rider.rider_longitude);
                          if (isNaN(riderLat) || isNaN(riderLng)) {
                            console.warn(`Invalid coordinates for rider ${rider.rider_id}:`, riderLat, riderLng);
                            return null;
                          }
                          
                          setRegion({
                            latitude: riderLat,
                            longitude: riderLng,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                          });
                          setViewMode('map');
                          setModalVisible(false);
                        }}
                        style={styles.mapButton}
                        labelStyle={styles.buttonLabel}
                      >
                        Map
                      </Button>
                      <Button
                        mode="contained"
                        onPress={() => {
                          setSelectedRider(rider);
                          setModalVisible(false);
                          setRiderModalVisible(true);
                        }}
                        style={styles.applyButton}
                        labelStyle={styles.buttonLabel}
                      >
                        Apply
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </ScrollView>
          
          <Button 
            mode="contained" 
            onPress={() => setModalVisible(false)}
            style={styles.closeModalButton}
          >
            Close
          </Button>
        </View>
      </View>
    </Modal>
  );

  const renderMapView = () => {
    if (!bookDetails || !customerLat || !customerLng) return null;

    const customerLocation = {
      latitude: customerLat,
      longitude: customerLng
    };

    // Filter out riders with invalid locations
    const validRiders = riderLocs.filter(rider => {
      const hasValidLocation = 
        rider.rider_latitude != null && 
        rider.rider_longitude != null &&
        !isNaN(parseFloat(rider.rider_latitude)) && 
        !isNaN(parseFloat(rider.rider_longitude));
      
      if (!hasValidLocation) {
        console.log(`Skipping rider ${rider.rider_id} - Invalid location data`);
      }
      return hasValidLocation;
    });

    return (
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsMarkerClusters={true}
        provider={PROVIDER_GOOGLE}
      >
        {/* Customer Marker */}
        {!isNaN(customerLat) && !isNaN(customerLng) && (
          <Marker
            coordinate={{
              latitude: customerLat,
              longitude: customerLng
            }}
            title="Your Location"
          >
            <Image source={customerMarker} style={styles.markerIcon} />
          </Marker>
        )}
  
        {/* Rider Markers */}
        {validRiders.map((rider) => {
          const riderLat = parseFloat(rider.rider_latitude);
          const riderLng = parseFloat(rider.rider_longitude);
          
          return (
            <Marker
              key={`rider-${rider.rider_id}`}
              coordinate={{
                latitude: riderLat,
                longitude: riderLng
              }}
              title={`${rider.user.first_name} ${rider.user.last_name}`}
              description={`Distance: ${formatDistance(rider.distance)} • Status: ${rider.verification_status}`}
              onCalloutPress={() => handleMarkerPress(rider)}
            >
              <Image source={riderMarker} style={styles.markerIcon} />
            </Marker>
          );
        })}
      </MapView>
    );
  };
  

  if (isLoading || !bookDetails) {
    return renderLoadingScreen();
  }

  // const renderMatchModal = () => (
  //   <Modal
  //     visible={showMatchModal}
  //     transparent={true}
  //     animationType="slide"
  //     onRequestClose={() => setShowMatchModal(false)}
  //   >
  //     <View style={styles.modalOverlay}>
  //       <View style={styles.modalContainer}>
  //         <Text style={styles.modalTitle}>Ride Match Found!</Text>
  //         {matchedRide && (
  //           <>
  //             <Text style={styles.modalText}>
  //               A rider has been matched with your ride request.
  //             </Text>
  //             <Text style={styles.modalText}>
  //               Rider Name: {matchedRide.rider_name}
  //             </Text>
  //             <Text style={styles.modalText}>
  //               Contact: {matchedRide.rider_contact}
  //             </Text>
  //             <Button
  //               mode="contained"
  //               onPress={() => setShowMatchModal(false)}
  //               style={styles.closeButton}
  //             >
  //               Close
  //             </Button>
  //           </>
  //         )}
  //       </View>
  //     </View>
  //   </Modal>
  // );

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            viewMode === 'details' ? styles.activeToggle : styles.inactiveToggle
          ]}
          onPress={() => setViewMode('details')}
        >
          <Text style={styles.toggleText}>Ride Details</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            viewMode === 'map' ? styles.activeToggle : styles.inactiveToggle
          ]}
          onPress={async () => {
            await fetchRiderLocations();
            setViewMode('map');
          }}
        >
          <Text style={styles.toggleText}>Rider Map</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#007BFF']} 
          />
        }
      >
        {viewMode === 'details' ? renderRideDetailsContent() : renderMapView()}
      </ScrollView>

      {renderRidersNearbyModal()}
      {renderRiderInfoModal()}
      {/* {renderMatchModal()} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    fontSize: 16,
    color: "#007BFF",
    marginTop: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'transparent',
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  activeToggle: {
    borderBottomWidth: 2,
    borderBottomColor: '#007BFF',
  },
  inactiveToggle: {
    backgroundColor: 'transparent',
  },
  toggleText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  background: {
    minHeight: height * 0.8,
    justifyContent: 'center',
    padding: 15,
  },
  surfaceCard: {
    borderRadius: 15,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  rideTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  rideTypeText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#007BFF',
    marginLeft: 10,
  },
  detailsContainer: {
    backgroundColor: '#F0F4F8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  fareText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#4CAF50',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chip: {
    flex: 0.48,
  },
  cancelChip: {
    backgroundColor: '#FF5722',
  },
  map: {
    width: '100%',
    height: height * 0.8,
  },
  markerIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 15,
    maxHeight: '80%', // Limit modal height
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  applicationCard: {
    marginBottom: 8,
    elevation: 2,
    borderRadius: 8,
  },
  cardContent: {
    padding: 8,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  riderInfoSection: {
    flex: 1,
  },
  applicantDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    fontSize: 13,
    color: '#666',
  },
  cardButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  mapButton: {
    flex: 0,
    minWidth: 80,
    backgroundColor: '#007BFF',
    borderRadius: 4,
    paddingVertical: 4,
  },
  closeModalButton: {
    marginTop: 15,
    backgroundColor: '#FF3D00', 
    borderRadius: 20,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  applyButton: {
    flex: 0,
    minWidth: 80,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingVertical: 4,
  },
  buttonLabel: {
    fontSize: 12,
    marginVertical: 0,
  },
  cancelButton: {
    borderColor: '#FF5722',
    borderWidth: 1,
  },
  
});

export default WaitingRider;