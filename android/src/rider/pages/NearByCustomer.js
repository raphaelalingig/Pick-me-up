import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';

const NearbyCustomerScreen = () => {
  const customers = [
    { name: 'Ibarra, Ray Anthony', pickup: 'Ibarra', dropoff: 'USTP', offer: 100 },
    { name: 'Buwanding, Aladdin', pickup: 'Singapore', dropoff: 'USTP', offer: 70 },
    { name: 'Ratunil, John Carlo', pickup: 'Singapore', dropoff: 'USTP', offer: 40 },
    { name: 'Juaton, Mark Jundy', pickup: 'Singapore', dropoff: 'USTP', offer: 120 },
  ];

  return (
    <ImageBackground
      source={{ uri: 'https://your-map-image-url.com' }} // Replace with your map image URL or local asset
      style={styles.background}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuButtonText}>☰</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>NEARBY CUSTOMER</Text>
        {customers.map((customer, index) => (
          <View key={index} style={styles.customerCard}>
            <View style={styles.customerInfo}>
              <Text style={styles.customerText}>Name: {customer.name}</Text>
              <Text style={styles.customerText}>Pickup: {customer.pickup}</Text>
              <Text style={styles.customerText}>Drop-off: {customer.dropoff}</Text>
              <Text style={styles.customerText}>Offer: {customer.offer}</Text>
            </View>
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>Click for more details</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
  },
  menuButton: {
    padding: 10,
  },
  menuButtonText: {
    fontSize: 24,
  },
  container: {
    backgroundColor: '#FFD700',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  customerCard: {
    backgroundColor: '#FFC107',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
  },
  customerText: {
    color: '#000',
    marginBottom: 5,
  },
  detailsButton: {
    backgroundColor: '#000',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  detailsButtonText: {
    color: '#FFF',
    fontSize: 12,
  },
});

export default NearbyCustomerScreen;

