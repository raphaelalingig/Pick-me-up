import React from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button, Text } from "react-native-paper"; // Import TextInput, Button, and Text from react-native-paper

const Login = ({ navigation }) => {
  return (
    <ImageBackground
      source={require("../pictures/PMU_Rider_Back.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>PICKME UP</Text>
          <Text style={styles.subtitle}>"Pick you up where every you are"</Text>
        </View>
        <TextInput label="Username" mode="outlined" style={styles.input} />
        <TextInput
          label="Password"
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />
        <Button
          mode="contained"
          style={styles.button}
          labelStyle={{ color: "#FFC533", fontSize: 20, fontWeight: "bold" }}
          onPress={() => navigation.navigate("RiderHome")}
        >
          Login as rider
        </Button>

        <Button
          mode="contained"
          style={styles.button}
          labelStyle={{ color: "#FFC533", fontSize: 20, fontWeight: "bold" }}
          onPress={() => navigation.navigate("CustomerHome")}
        >
          Login as Customer
        </Button>
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don’t have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLink}>Register Here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
    backgroundColor: "black", // Change this to the desired background color
    paddingVertical: 20, // Add padding to make it look better
    borderRadius: 10, // Optional: Add border radius for rounded corners
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFC533",
  },
  subtitle: {
    fontSize: 16,
    color: "#FFC533",
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    padding: 5,
    backgroundColor: "#000",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  registerText: {
    color: "#fff",
  },
  registerLink: {
    color: "#0000EE",
    textDecorationLine: "underline",
  },
});

export default Login;
