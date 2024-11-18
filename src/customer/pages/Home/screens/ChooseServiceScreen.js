// screens/ChooseServiceScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Text } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { ServiceCard } from '../components/ServiceCard';
import { CustomButton } from '../CustomButton';
import { COLORS } from '../constants/theme';

const services = [
  {
    id: 'moto-taxi',
    title: 'Moto-Taxi',
    description: 'Bring you wherever you want',
    icon: (props) => <MaterialCommunityIcons name="motorbike" {...props} />,
    screen: 'Motor Taxi',
  },
  {
    id: 'delivery',
    title: 'Delivery',
    description: 'We deliver what you need',
    icon: (props) => <MaterialCommunityIcons name="bike" {...props} />,
    screen: 'Delivery',
  },
  {
    id: 'pakyaw',
    title: 'Pakyaw',
    description: 'Ride with friend & family',
    icon: (props) => <FontAwesome5 name="users" {...props} />,
    screen: 'Pakyaw',
  },
];

export const ChooseServiceScreen = ({ navigation, onCancel }) => {
  const [selectedService, setSelectedService] = useState(null);

  const handleServicePress = (service) => {
    navigation.navigate(service.screen);
  };

  return (
    <ImageBackground
      source={require("../../../../pictures/3.png")}
      style={styles.background}
    >
      <BlurView intensity={80} tint="light" style={styles.container}>
        <Text style={styles.header}>CHOOSE RIDER SERVICES</Text>
        
        <View style={styles.servicesContainer}>
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              icon={service.icon}
              title={service.title}
              description={service.description}
              selected={selectedService === service.id}
              onPress={() => handleServicePress(service)}
            />
          ))}
        </View>

        <CustomButton
          title="Cancel"
          onPress={onCancel}
          variant="danger"
        />
      </BlurView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    padding: 24,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  servicesContainer: {
    flex: 1,
    gap: 16,
    marginBottom: 24,
  },
});