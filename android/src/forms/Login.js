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
        <Button
          onPress={() => navigation.navigate("CustomerHome")}
          style={styles.loginCustomerButton}
        >
          <Text>Login as Customer</Text>
        </Button>
      </TouchableOpacity>
      <TouchableOpacity>
        <Button
          onPress={() => navigation.navigate("RiderHome")}
          style={styles.loginRiderButton}
        >
          <Text>Login as Rider</Text>
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
  loginCustomerButton: {
    padding: 10,
    backgroundColor: "yellow",
    marginBottom: 10,
  },
  loginRiderButton: {
    padding: 10,
    backgroundColor: "yellow",
    marginBottom: 10,
  },
});
