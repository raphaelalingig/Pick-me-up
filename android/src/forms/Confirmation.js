import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Button } from "react-native-paper";

const Confirmation = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);

  const handleOtpChange = (index, value) => {
    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  return (
    <View style={styles.container}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        {/* You can use any icon library here */}
        <Text style={styles.lockIcon}>🔒</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Verification</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Enter OTP code sent to your number</Text>

      {/* OTP Input Fields */}
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

      {/* Continue Button */}
      <Button
        mode="contained"
        style={styles.continueButton}
        onPress={() => {
          // Add logic for verifying OTP here
          console.log("OTP Submitted: ", otp.join(""));
        }}
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
