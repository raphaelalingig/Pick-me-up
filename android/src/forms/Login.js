import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native"; // Import TouchableOpacity from react-native
import { TextInput, Button, Text } from "react-native-paper"; // Import TextInput, Button, and Text from react-native-paper

const Login = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pick Me Up</Text>
      <Text style={styles.subtitle}>“Pick you up where ever you are”</Text>

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
        labelStyle={{ color: "#FBC635" }}
      >
        Login
      </Button>
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>
          Don't have an account?{" "}
          <Text style={{ color: "blue", textDecorationLine: "underline" }}>
            Register Here
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    backgroundColor: "black",
  },
  registerText: {
    marginTop: 20,
    textAlign: "center",
  },
});

export default Login;
