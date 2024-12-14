// ForgotPassword.js
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from "react-native";
import { Text, Button } from "react-native-paper";

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // Track the current step

  const handleSendEmail = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    try {
      // Replace this with your API call to send a confirmation code
      await fakeApiSendCode(email);
      Alert.alert(
        "Success",
        "A confirmation code has been sent to your email."
      );
      setStep(2);
    } catch (error) {
      Alert.alert("Error", "Failed to send email. Please try again.");
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert("Error", "Please enter the confirmation code.");
      return;
    }

    try {
      // Replace this with your API call to verify the confirmation code
      await fakeApiVerifyCode(email, code);
      Alert.alert("Success", "Code verified. You can now set a new password.");
      setStep(3);
    } catch (error) {
      Alert.alert("Error", "Invalid confirmation code. Please try again.");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      // Replace this with your API call to reset the password
      await fakeApiResetPassword(email, newPassword);
      Alert.alert("Success", "Your password has been reset. Please log in.");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Error", "Failed to reset password. Please try again.");
    }
  };

  return (
    <View
      
      style={styles.background}
    >
      <View style={styles.container}>
        {step === 1 && (
          <>
            <Text style={styles.title}>Forgot Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <Button
              mode="contained"
              onPress={handleSendEmail}
              style={styles.button}
            >
              Send Email
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.title}>Enter Confirmation Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter the code"
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
            />
            <Button
              mode="contained"
              onPress={handleVerifyCode}
              style={styles.button}
            >
              Verify Code
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.title}>Reset Password</Text>
            <TextInput
              style={styles.input}
              placeholder="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <Button
              mode="contained"
              onPress={handleResetPassword}
              style={styles.button}
            >
              Reset Password
            </Button>
          </>
        )}
      </View>
    </View>
  );
};

const fakeApiSendCode = async (email) => {
  // Simulate API call
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const fakeApiVerifyCode = async (email, code) => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (code === "1234") resolve();
      else reject();
    }, 1000);
  });
};

const fakeApiResetPassword = async (email, password) => {
  // Simulate API call
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#f8f8ff",
  },
  button: {
    backgroundColor: "#daa520",
    marginTop: 10,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
  },
});

export default ForgotPassword;
