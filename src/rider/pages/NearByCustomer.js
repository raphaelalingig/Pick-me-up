import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import ApplyRideModal from './ApplyRideModal';
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
  Platform,
  Dimensions
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-root-toast';
import FindingCustomerSpinner from "../spinner/FindingCustomerSpinner";
import NearbyCustomersMap from "./NearbyCustomersMap";
import userService from "../../services/auth&services";
import usePusher1 from "../../services/pusher";
import { usePusher } from "../../context/PusherContext";
import { useAuth } from "../../services/useAuth";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const NearbyCustomerScreen = ({ navigation }) => {
  const [showSpinner, setShowSpinner] = useState(true);
  const [availableRides, setAvailableRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyRide, setApplyRide] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const pusher = usePusher1();
  const [user_id, setUser_id] = useState();
  const [riderLocations, setRiderLocations] = useState();
  const [rider, setRider] = useState();
  const { userId } = useAuth();
  
  

  // const { showApplyModal, setShowApplyModal, applyRide, setApplyRide } = usePusher();

  // const { 
  //   availableRides: pusherRides,
  // } = usePusher();

  // // Update local rides when Pusher sends new data
  // useEffect(() => {
  //   if (pusherRides && pusherRides.length > 0) {
  //     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  //     setAvailableRides(pusherRides);
  //   }
  // }, [pusherRides]);

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

      const appResponse = await userService.getApplications(id.user_id);

      if (appResponse.data && appResponse.data.length > 0) {
        const firstApplication = appResponse.data[0];
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
          ridesChannel.unbind_all();
          appliedChannel.unbind_all();
          bookedChannel.unbind_all();
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


  useEffect(() => {
    filterRides(activeFilter);
  }, [availableRides, activeFilter]);

  const filterRides = (filterType) => {
    // First, filter out Motor Taxi rides
    const nonMotorTaxiRides = availableRides.filter(ride => ride.ride_type !== 'Moto Taxi');
  
    switch (filterType) {
      case 'deliveries':
        setFilteredRides(nonMotorTaxiRides.filter(ride => ride.ride_type === 'Delivery'));
        break;
      case 'pakyaw':
        setFilteredRides(nonMotorTaxiRides.filter(ride => ride.ride_type === 'Pakyaw'));
        break;
      default:
        setFilteredRides(nonMotorTaxiRides);
        break;
    }
  };

  const handleFilterPress = (filterType) => {
    setActiveFilter(filterType);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const fetchRiderLocations = async () => {
    try {
      const response = await userService.fetchLoc();
      setRiderLocations(response);
    } catch (error) {
      console.error('Error fetching rider locations:', error);
      Alert.alert('Error', 'Failed to retrieve rider locations. Please try again.');
    }
  };

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
      fetchRiderLocations();
      setShowApplyModal(false); // Reset modal visibility
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAvailableRides();
    setRefreshing(false);
  }, []);

  const handleShowMap = () => {
    if (riderLocations.length > 0) {
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
          riderLocations={riderLocations}
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
              <View style={styles.headerContainer}>
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={handleShowMap}
                >
                  <MaterialIcons name="place" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.mapButtonText}>Show Map</Text>
                </TouchableOpacity>

                <View style={styles.filterContainer}>
                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      activeFilter === 'all' && styles.filterButtonActive
                    ]}
                    onPress={() => handleFilterPress('all')}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      activeFilter === 'all' && styles.filterButtonTextActive
                    ]}>All</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      activeFilter === 'deliveries' && styles.filterButtonActive
                    ]}
                    onPress={() => handleFilterPress('deliveries')}
                  >
                    <MaterialIcons 
                      name="local-shipping" 
                      size={18} 
                      color={activeFilter === 'deliveries' ? '#fff' : '#0096FF'} 
                      style={styles.buttonIcon} 
                    />
                    <Text style={[
                      styles.filterButtonText,
                      activeFilter === 'deliveries' && styles.filterButtonTextActive
                    ]}>Deliveries</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      activeFilter === 'pakyaw' && styles.filterButtonActive
                    ]}
                    onPress={() => handleFilterPress('pakyaw')}
                  >
                    <MaterialCommunityIcons 
                      name="truck-delivery" 
                      size={18} 
                      color={activeFilter === 'pakyaw' ? '#fff' : '#0096FF'} 
                      style={styles.buttonIcon} 
                    />
                    <Text style={[
                      styles.filterButtonText,
                      activeFilter === 'pakyaw' && styles.filterButtonTextActive
                    ]}>Pakyaw</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {filteredRides.length === 0 ? (
                <View style={styles.noRidesContainer}>
                  <Text style={styles.noRidesText}>No rides available at the moment.</Text>
                </View>
              ) : (
                <ScrollView contentContainerStyle={styles.container}>
                  {filteredRides.map((ride, index) => (
                    <TouchableOpacity
                      key={ride.ride_id || `ride-${index}`}
                      style={styles.customerCard}
                      onPress={() => navigation.navigate("BookingDetails", { ride })}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.rideTypeContainer}>
                        {
  ride.ride_type === 'Delivery' ? (
    <MaterialIcons
      name="package-variant-closed"
      size={16}
      color="#0096FF"
      style={styles.rideTypeIcon}
    />
  ) : (
    <MaterialCommunityIcons
      name="motorbike"
      size={16}
      color="#0096FF"
      style={styles.rideTypeIcon}
    />
  )
}
                          <Text style={styles.rideType}>{ride.ride_type}</Text>
                        </View>
                        <Text style={styles.timestamp}>
                          {new Date(ride.created_at).toLocaleTimeString()}
                        </Text>
                      </View>
                      
                      <View style={styles.cardContent}>
                        <View style={styles.customerInfo}>
                          <Text style={styles.customerName}>
                            {`${ride.first_name} ${ride.last_name}`}
                          </Text>
                          <View style={styles.locationContainer}>
                            <MaterialIcons name="place" size={14} color="#666" />
                            <Text style={styles.customerLocation}>
                              {ride.pickup_location}
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.detailsButtonContainer}>
                          <Text style={styles.detailsButtonText}>View Details</Text>
                          <MaterialIcons name="chevron-right" size={20} color="#333" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          )}

          {applyRide && (
            <ApplyRideModal
              visible={showApplyModal}
              ride={applyRide}
              userService={userService} 
              navigation={navigation} 
              onClose={() => setShowApplyModal(false)}
            />
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
    backgroundColor: "#F5F5F5",
  },
  headerContainer: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    padding: 15,
    paddingTop: 5,
  },
  mapButton: {
    backgroundColor: "#0096FF",
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  buttonIcon: {
    marginRight: 8,
  },
  mapButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0096FF',
  },
  filterButtonActive: {
    backgroundColor: '#0096FF',
  },
  filterButtonText: {
    color: '#0096FF',
    fontWeight: '600',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  customerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 15,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rideTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rideTypeIcon: {
    marginRight: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerLocation: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  rideType: {
    fontSize: 14,
    color: '#0096FF',
    fontWeight: '600',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  customerLocation: {
    fontSize: 14,
    color: '#666',
  },
  detailsButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginRight: 4,
  },
  arrowIcon: {
    fontSize: 16,
    color: '#333',
  },
  noRidesContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 15,
    borderRadius: 12,
  },
  noRidesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NearbyCustomerScreen;