import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import { BlurView } from "expo-blur";
import { MaterialIcons } from "@expo/vector-icons";
import userService from "../../services/auth&services";
import { usePusher } from '../../context/PusherContext';
import ApplyRideModal from './ApplyRideModal';

const BookingDetailsScreen = ({ route, navigation }) => {
  const { ride, isAccepting } = route.params;
  const [riderLocation, setRiderLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [accepting, setAccepting] = useState(isAccepting || false);

  const { 
    applyRide, 
    setApplyRide,
    showApplyModal, 
    setShowApplyModal 
  } = usePusher();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await userService.getUserId();
        const id = parseInt(response, 10);
        setUserId(id);
      } catch (error) {
        console.error("Error fetching user_id:", error);
      }
    };

    fetchUserId();
  }, []);

  const handleApply = async (ride) => {
    if (!userId) {
      Alert.alert("Error", "User ID is not available.");
      return;
    }

    setIsLoading(true);
    const ride_id = ride.ride_id;
    const customer = ride.user_id;

    try {
      const response = await userService.apply_ride(ride_id, customer);
      if (response.data.message === "exist") {
        Alert.alert("Already Applied", "You have already applied for this ride.");
        navigation.goBack();
      } else if (response.data.message === "applied") {
        Alert.alert("Success", "Applied Successfully! 🎉");
        navigation.goBack();
      } else if (response.data && response.data.message) {
        Alert.alert("Match Found! 🎯", "You have found a Match!");
        navigation.navigate("Home");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "An error occurred. Please try again.";
      Alert.alert("Error", errorMessage);
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewLocation = () => {
    navigation.navigate("Booked Location", { ride });
  };

  const DetailItem = ({ icon, label, value }) => (
    <View style={styles.detailItem}>
      <MaterialIcons name={icon} size={24} color="#666" style={styles.icon} />
      <View style={styles.detailContent}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../pictures/4.png")}
        style={styles.background}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <BlurView intensity={80} tint="light" style={styles.blurContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Booking Details</Text>
              <View style={styles.fareTag}>
                <Text style={styles.fareText}>₱{ride.fare}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <DetailItem
                icon="person"
                label="Passenger"
                value={`${ride.first_name} ${ride.last_name}`}
              />
              <DetailItem
                icon="location-on"
                label="Pickup Location"
                value={ride.pickup_location}
              />
              <DetailItem
                icon="location-off"
                label="Drop-off Location"
                value={ride.dropoff_location}
              />
              <DetailItem
                icon="local-taxi"
                label="Service Type"
                value={ride.ride_type}
              />
            </View>

            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleViewLocation}
            >
              <MaterialIcons name="map" size={20} color="#007AFF" />
              <Text style={styles.locationButtonText}>View on Map</Text>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyButton, isLoading && styles.disabledButton]}
                onPress={() => {
                  Alert.alert(
                    accepting ? "Confirm Pick Up" : "Confirm Application",
                    accepting
                      ? "Are you sure you want to pick up this ride?"
                      : "Are you sure you want to apply for this ride?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: accepting ? "Pick Up" : "Apply",
                        onPress: () => handleApply(ride),
                      },
                    ]
                  );
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>
                    {accepting ? "Pick Up" : "Apply Now"}
                  </Text>
                )}
              </TouchableOpacity>

            </View>
            {applyRide && (
              <ApplyRideModal
                visible={showApplyModal}
                ride={applyRide}
                userService={userService} 
                navigation={navigation} 
                onClose={() => setShowApplyModal(false)}
              />
            )}

          </BlurView>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: "hidden",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  fareTag: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  fareText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  icon: {
    width: 24,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  locationButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FF3B30",
    paddingVertical: 16,
    borderRadius: 12,
    marginRight: 8,
    alignItems: "center",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#34C759",
    paddingVertical: 16,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default BookingDetailsScreen;