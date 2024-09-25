import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { Button } from "react-native-paper";
import userService from "../services/auth&services"; // Import userService if not already

const Confirmation = ({ route, navigation }) => {
  // Extract the data passed from Register component
  const { 
    email, 
    mobile_number, 
    user_name, 
    first_name, 
    last_name, 
    gender, 
    date_of_birth, 
    password, 
    userType 
  } = route.params;

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (index, value) => {
    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const enteredOtp = otp.join(""); // Combine OTP digits into a single string
      // Perform OTP verification here (e.g., validate OTP with backend)
      const registrationData = {
        user_name,
        first_name,
        last_name,
        gender,
        date_of_birth,
        email,
        password,
        password_confirmation: password, // Confirm password
        mobile_number,
        role_id: userType === "Customer" ? 4 : 3, // Convert userType to role_id
        otp: enteredOtp,
      };

      const response = await userService.signup(registrationData);
      
      if (response.status === 201) {
        console.log("Registration successful");
        navigation.replace("Login");
      } else {
        console.log("Registration failed");
      }
    } catch (error) {
      console.error("OTP Verification error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.lockIcon}>🔒</Text>
      </View>
      <Text style={styles.title}>Verification</Text>
      <Text style={styles.subtitle}>Enter OTP code sent to your number</Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={(value) => handleOtpChange(index, value)}
          />
        ))}
      </View>

      <Button
        mode="contained"
        style={styles.continueButton}
        onPress={verifyOtp}
        loading={loading}
        disabled={loading}
      >
        Continue
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 40,
  },
  lockIcon: {
    fontSize: 60,
    color: "#00ACC1",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 40,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: "#ccc",
    textAlign: "center",
    fontSize: 24,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  continueButton: {
    backgroundColor: "#FFC533",
    width: "80%",
    borderRadius: 8,
    paddingVertical: 10,
  },
});

export default Confirmation;
