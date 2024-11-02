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
import MapView, { Marker } from 'react-native-maps';
import riderMarker from "../../../assets/rider.png";
import customerMarker from "../../../assets/customer.png";
import { CustomerContext } from "../../context/customerContext";

const { width, height } = Dimensions.get('window');

const WaitingRider = ({ navigation }) => {
  const { customerCoords } = useContext(CustomerContext);
  const [region, setRegion] = useState({
    latitude: customerCoords.latitude,
    longitude: customerCoords.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [bookDetails, setBookDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('details'); // 'details' or 'map'
  const [modalVisible, setModalVisible] = useState(false);
  const [applications, setApplications] = useState([]);

  const fetchLatestRide = useCallback(async () => {
    try {
      const ride = await userService.checkActiveBook();
      setBookDetails(ride.rideDetails);
      setIsLoading(false);
    } catch (error) {
      Alert.alert("Error", "Failed to retrieve the latest available ride.");
      setIsLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      if (!bookDetails?.ride_id) return;
      const response = await userService.getRideApplications(bookDetails.ride_id);
      setApplications(response.applications);
      setModalVisible(true);
    } catch (error) {
      Alert.alert("Error", "Failed to retrieve rider applications.");
    }
  }, [bookDetails]);

  useEffect(() => {
    fetchLatestRide();
  }, [fetchLatestRide]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLatestRide().then(() => setRefreshing(false));
  }, [fetchLatestRide]);

  const handleCancel = useCallback(async () => {
    if (!bookDetails?.ride_id) return;

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

  const renderLoadingScreen = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007BFF" />
      <Text style={styles.loadingText}>Finding your rider...</Text>
    </View>
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
            onPress={fetchApplications} 
            style={styles.chip}
          >
            View Applications
          </Chip>
          <Chip 
            icon="close-circle" 
            onPress={handleCancel} 
            style={[styles.chip, styles.cancelChip]}
          >
            Cancel Ride
          </Chip>
        </View>
      </Surface>
    </ImageBackground>
  );

  const renderRiderApplicationsModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Nearby Rider Applications</Text>
          <ScrollView>
            {applications.map((app, index) => (
              <Card key={index} style={styles.applicationCard}>
                <Card.Content>
                  <Text style={styles.applicantName}>{app.name}</Text>
                  <View style={styles.applicantDetails}>
                    <Text>Rating: {app.rating} ⭐</Text>
                    <Text>Distance: {app.distance} km</Text>
                  </View>
                </Card.Content>
              </Card>
            ))}
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

  const renderMapView = () => (
    <MapView
      style={styles.map}
      region={region}
      onRegionChangeComplete={setRegion}
    >
      <Marker
        coordinate={{
          latitude: customerCoords.latitude,
          longitude: customerCoords.longitude,
        }}
        title="Your Location"
      >
        <Image source={customerMarker} style={styles.markerIcon} />
      </Marker>
    </MapView>
  );

  if (isLoading || !bookDetails) {
    return renderLoadingScreen();
  }

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
          onPress={() => setViewMode('map')}
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

      {renderRiderApplicationsModal()}
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
    backgroundColor: 'transparent', // Changed to transparent
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: 'transparent', // Changed to transparent
  },
  activeToggle: {
    borderBottomWidth: 2,
    borderBottomColor: '#007BFF',
  },
  inactiveToggle: {
    backgroundColor: 'transparent', // Removed background color
  },
  toggleText: {
    color: '#007BFF', // Active toggle text color
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  applicationCard: {
    marginBottom: 10,
    elevation: 3,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  applicantDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  closeModalButton: {
    marginTop: 15,
  },
});

export default WaitingRider;