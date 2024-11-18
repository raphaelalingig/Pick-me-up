import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS } from '../constants/theme';

export const ServiceCard = ({ icon: Icon, title, description, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.serviceCard, selected && styles.selectedCard]}
    onPress={onPress}
  >
    <View style={styles.serviceContent}>
      <View style={styles.iconContainer}>
        <Icon size={24} color={COLORS.secondary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.serviceTitle}>{title}</Text>
        <Text style={styles.serviceDescription}>{description}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  serviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    elevation: 2,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(251,198,53,0.1)',
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: 'rgba(251,198,53,0.2)',
    padding: 10,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  serviceDescription: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
});