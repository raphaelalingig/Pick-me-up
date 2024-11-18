// screens/BookNowScreen.js
import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Text } from 'react-native-paper';
import { CustomButton } from '../CustomButton';
import { COLORS } from '../constants/theme';

export const BookNowScreen = ({ onBookNow, loading, navigation }) => (
  <ImageBackground
    source={require("../../../../pictures/2.png")}
    style={styles.background}
  >
    <View style={styles.overlay}>
      <View style={styles.content}>
        <View style={styles.titleCard}>
          <Text variant="headlineMedium" style={styles.title}>
            PICKME UP
          </Text>
          <Text style={styles.subtitle}>
            Pick you up wherever you are.
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <CustomButton
            title="Book Now"
            onPress={onBookNow}
            loading={loading}
            variant="secondary"
          />
          <CustomButton
            title="View Location"
            onPress={() => navigation.navigate("Location")}
            variant="primary"
          />
        </View>
      </View>
    </View>
  </ImageBackground>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 40,
  },
  titleCard: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.primary,
    fontSize: 16,
  },
  actionContainer: {
    gap: 16,
    alignItems: 'center',
  },
});