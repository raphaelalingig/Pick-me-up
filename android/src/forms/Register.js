import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native"; // Import TouchableOpacity from react-native
import { TextInput, Button, Text, Surface } from "react-native-paper"; // Import other components from react-native-paper

export default function Register({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Text style={styles.title}>SIGNUP</Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Create Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Add Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          mode="outlined"
          style={styles.input}
          keyboardType="phone-pad"
        />
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLink}>Login</Text>
          </Text>
        </TouchableOpacity>

        <Button
          mode="contained"
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Sign Up
        </Button>
      </Surface>

      <View style={styles.circle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  surface: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
    backgroundColor: "#333333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#ffffff",
  },
  loginText: {
    color: "#ffffff",
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  loginLink: {
    color: "#ffd700",
  },
  button: {
    backgroundColor: "#ffd700",
  },
  buttonLabel: {
    color: "#000000",
  },
  circle: {
    position: "absolute",
    bottom: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ffd700",
  },
});
