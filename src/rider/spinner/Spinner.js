import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { ActivityIndicator, MD2Colors } from "react-native-paper";

const Spinner = () => {
  return (
    <View>
      <ActivityIndicator
        animating={true}
        color={MD2Colors.yellow800}
        size={50}
      />
    </View>
  );
};

export default Spinner;

const styles = StyleSheet.create({});
