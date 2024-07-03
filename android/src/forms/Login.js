import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Button, Text } from "react-native-paper";

const Login = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View>
        <Text>PICK ME UP</Text>
      </View>
      <TouchableOpacity>
        <Button style={styles.loginButton}>
          <Text onPress={() => navigation.navigate("Dashboard")}>Login</Text>
        </Button>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButton: {
    padding: 10,
    backgroundColor: "yellow",
  },
});
