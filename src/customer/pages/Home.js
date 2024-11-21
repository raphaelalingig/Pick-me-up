import React, { useState, useEffect, useContext, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
  StatusBar,
} from "react-native";
import { Text, Button, Surface } from "react-native-paper";
import { CustomerContext } from "../../context/customerContext";
import * as Location from "expo-location";
import userService from "../../services/auth&services";
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const BookNow = ({ setCurrentForm, navigation, checkRideAndLocation }) => {
  const [loading, setLoading] = useState(false);

  const handleBookNow = async () => {
    setLoading(true);
    try {
      const user_status = await userService.fetchCustomer();
      if (user_status.message === "Account Disabled") {
        Alert.alert("Account Disabled", "Your account has been disabled. Please contact Admin for more information.");
        return "Cannot Book";
      }
      const result = await checkRideAndLocation();
      if (result === "proceed") {
        setCurrentForm("ChooseServiceScreen");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to process your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../pictures/2.png")}
      style={styles.background}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
        style={styles.gradientOverlay}
      >
        <View style={styles.contentContainer}>
          <Surface style={styles.logoContainer} elevation={5}>
            <Text style={styles.logoText}>PICKME UP</Text>
            <Text style={styles.taglineText}>
              Your ride, your way, right away
            </Text>
          </Surface>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.bookNowButton}
              onPress={handleBookNow}
              disabled={loading}
            >
              <LinearGradient
                colors={['#FBC635', '#FDA429']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.bookNowText}>
                  {loading ? "Checking..." : "BOOK NOW"}
                </Text>
                {!loading && <Ionicons name="arrow-forward" size={24} color="black" style={styles.buttonIcon} />}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewLocationButton}
              onPress={() => navigation.navigate("Location")}
            >
              <MaterialCommunityIcons name="map-marker" size={24} color="#FBC635" />
              <Text style={styles.viewLocationText}>View Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const ServiceCard = ({ icon, title, description, onPress, selected }) => (
  <TouchableOpacity
    style={[styles.serviceCard, selected && styles.selectedCard]}
    onPress={onPress}
  >
    <LinearGradient
      colors={selected ? ['#FBC635', '#FDA429'] : ['#ffffff', '#f8f8f8']}
      style={styles.serviceGradient}
    >
      <View style={styles.serviceIconContainer}>
        {icon}
      </View>
      <View style={styles.serviceTextContainer}>
        <Text style={[styles.serviceTitle, selected && styles.selectedText]}>
          {title}
        </Text>
        <Text style={[styles.serviceDescription, selected && styles.selectedText]}>
          {description}
        </Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const ChooseServiceScreen = ({ setCurrentForm, navigation, havePakyaw }) => {
  const [selectedService, setSelectedService] = useState(null);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    navigation.navigate(service);
  };

  const handleCheckPakyaw = (service) => {
    console.log(havePakyaw)
    if (havePakyaw === true){
      navigation.navigate("Pakyaw");
    }else{
      handleServiceSelect(service);
    }
    
  };

  return (
    <ImageBackground
      source={require("../../pictures/3.png")}
      style={styles.background}
    >
      <BlurView intensity={80} tint="light" style={styles.servicesContainer}>
        <Text style={styles.screenTitle}>Choose Your Service</Text>
        
        <View style={styles.servicesGrid}>
          <ServiceCard
            icon={<MaterialCommunityIcons name="motorbike" size={32} color={selectedService === "Moto Taxi" ? "#000" : "#FBC635"} />}
            title="Moto-Taxi"
            description="Quick rides to your destination"
            onPress={() => handleServiceSelect("Moto Taxi")}
            selected={selectedService === "Moto Taxi"}
          />

          <ServiceCard
            icon={<MaterialCommunityIcons name="bike" size={32} color={selectedService === "Delivery" ? "#000" : "#FBC635"} />}
            title="Delivery"
            description="Fast & reliable deliveries"
            onPress={() => handleServiceSelect("Delivery")}
            selected={selectedService === "Delivery"}
          />

          <ServiceCard
            icon={<FontAwesome5 name="users" size={28} color={selectedService === "Book Pakyaw" ? "#000" : "#FBC635"} />}
            title="Pakyaw"
            description="Group rides & special trips"
            onPress={() => handleCheckPakyaw("Book Pakyaw")}
            selected={selectedService === "Book Pakyaw"}
          />
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentForm("BookNow")}
        >
          <Text style={styles.backButtonText}>← Back to Main Menu</Text>
        </TouchableOpacity>
      </BlurView>
    </ImageBackground>
  );
};

const MainComponent = ({ navigation, route }) => {
  const [currentForm, setCurrentForm] = useState("BookNow");
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [havePakyaw, setHavePakyaw] = useState(false);
  
  const { customerCoords, setCustomerCoords } = useContext(CustomerContext);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      const havePakyaw = route.params?.havePakyaw;
      if (havePakyaw !== undefined) {
        setHavePakyaw(havePakyaw);
      }
    });
  
    return unsubscribe;
  }, [navigation, route.params]);

  const checkRideAndLocation = useCallback(async () => {
    try {
      // Get location if no existing ride
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return "location_denied";
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      setCustomerCoords({
        accuracy: location.coords.accuracy,
        longitude: location.coords.longitude,
        latitude: location.coords.latitude,
        altitude: location.coords.altitude,
        altitudeAccuracy: location.coords.altitudeAccuracy,
        timestamp: location.timestamp,
      });

      const response = await userService.checkActiveBook();
      const ride = response.rideDetails;
      console.log(ride)
      if (response && response.hasActiveRide) {
        const { status } = response.rideDetails;
        const { ride_type } = response.rideDetails;
        setHavePakyaw(ride_type === "Pakyaw");
        console.log("pakyaw???",response.rideDetails.ride_type);
        if (ride_type !== "Pakyaw"){
          setHavePakyaw(false);
          switch (status) {
            case "Available":
              navigation.navigate("WaitingForRider", { ride });
              return "existing_booking";
            case "Booked":
              navigation.navigate("Tracking Rider", { ride });
              return "existing_ride";
            case "In Transit":
              navigation.navigate("In Transit", { ride });
              return "in_transit";
            case "Review":
              navigation.navigate("To Review", { ride });
              return "review";
          }
        }
        
      }

      return "proceed";
    } catch (error) {
      setErrorMsg("Error fetching location or ride status");
      return "error";
    }
  }, [navigation, setCustomerCoords]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkRideAndLocation();
    setRefreshing(false);
  }, [checkRideAndLocation]);

  // Automatically refresh when the screen is focused
  useFocusEffect(
    useCallback(() => {
      checkRideAndLocation();
    }, [checkRideAndLocation])
  );

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={{ flex: 1 }}>
        {currentForm === "BookNow" ? (
          <BookNow
            setCurrentForm={setCurrentForm}
            navigation={navigation}
            checkRideAndLocation={checkRideAndLocation}
          />
        ) : (
          <ChooseServiceScreen
            setCurrentForm={setCurrentForm}
            navigation={navigation}
            havePakyaw={havePakyaw}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
    paddingTop: StatusBar.currentHeight + 20,
  },
  logoContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 50,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FBC635",
    letterSpacing: 2,
  },
  taglineText: {
    fontSize: 16,
    color: "#FBC635",
    marginTop: 10,
    fontWeight: "500",
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 50,
  },
  bookNowButton: {
    width: '90%',
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 20,
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  bookNowText: {
    fontSize: 20,
    fontWeight: "800",
    color: "black",
    marginRight: 10,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  viewLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  viewLocationText: {
    color: "#FBC635",
    fontSize: 16,
    marginLeft: 8,
    textDecorationLine: "underline",
  },
  servicesContainer: {
    flex: 1,
    margin: 15,
    borderRadius: 20,
    padding: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000",
    textAlign: "center",
    marginBottom: 30,
  },
  servicesGrid: {
    gap: 15,
  },
  serviceCard: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  serviceGradient: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 5,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#666",
  },
  selectedCard: {
    transform: [{ scale: 1.02 }],
  },
  selectedText: {
    color: "#000",
  },
  backButton: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
});

export default MainComponent;