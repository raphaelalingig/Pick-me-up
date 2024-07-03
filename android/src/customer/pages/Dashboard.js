import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";

const Dashboard = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.menuIcon}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <AntDesign name="menu-fold" size={36} color="black" />
        </TouchableOpacity>
      </View>
      <Text>Dashboard</Text>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIcon: {
    position: "absolute",
    top: 40,
    left: 20,
  },
});
