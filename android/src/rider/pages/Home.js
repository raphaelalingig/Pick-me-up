import { StyleSheet, View } from "react-native";
import React from "react";
import { Button, Text } from "react-native-paper";

const Home = ({ navigation }) => {
  return (
    <View>
      <Text> RiderHome</Text>
      <Button
        style={styles.logoutButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text>Logout</Text>
      </Button>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: "yellow",
  },
});
