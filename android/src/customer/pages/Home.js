import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import { Button } from "react-native-paper";

const Home = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text>CUstomer Home</Text>
      <Button onPress={() => navigation.navigate('Login')} style={styles.logoutButton}>
        <Text>Logout</Text>
      </Button>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    padding: 5,
    backgroundColor: "yellow",
  },
});
