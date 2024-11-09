import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Spinner from "./Spinner";

const FindingCustomerSpinner = () => {
  return (
    <View style={styles.container}>
      <Spinner />
      <View style={{ marginTop: 10 }}>
        <Text>No rides available at the moment.</Text>
      </View>
    </View>
  );
};

export default FindingCustomerSpinner;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 5,
  },
});
