import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { TextInput, Text, RadioButton } from "react-native-paper";
import userService from "../../services/auth&services";

const ReportRiderPage = ({ navigation, route }) => {
  const { ride, role } = route.params;
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [user_id, setUserId] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    "Rider was rude",
    "Reckless driving",
    "Overcharged me",
    "Unprofessional behavior",
    "Other",
  ];

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await userService.getUserId();
        const id = parseInt(response, 10);
        setUserId(id);
      } catch (error) {
        console.error("Error fetching user_id:", error);
      }
    };

    fetchUserId();
  }, []);

  const handleSubmit = async () => {
    const senderId = role === "Customer" ? ride.user_id : ride.rider_id;
    const recipientId = role === "Customer" ? ride.rider_id : ride.user_id;
    
    if (!reason) {
      Alert.alert("Missing Reason", "Please select a reason for reporting.");
      return;
    }

    try {
      setIsSubmitting(true);

      const reportData = {
        sender: senderId,
        ride_id: ride.ride_id,
        recipient: recipientId,
        reason,
        comments,
      };

      // Stub for sending report data to backend
      console.log("Submitting report:", reportData);
      const response = await userService.submitReport(reportData);

      console.log(response.message)

      if (response.message === "You have already submitted a report for this ride"){
        Alert.alert(
          "Already Submitted",
          response.message,
          [
            {
              text: "OK",
              onPress: () => navigation.goBack()
            }
          ]
        );
        return;
      }

      if (response.message === "Feedback submitted successfully"){
        Alert.alert(
          "Success",
          "Thank you for your feedback!",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const riderName =`${ride.rider.first_name || ""} ${ride.rider.last_name || ""}`;
  console.log(riderName)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report Rider: {riderName}</Text>
      <Text style={styles.subtitle}>Why are you reporting this rider?</Text>

      <RadioButton.Group onValueChange={(value) => setReason(value)} value={reason}>
        {reasons.map((item, index) => (
          <View style={styles.radioItem} key={index}>
            <RadioButton value={item} />
            <Text style={styles.radioLabel}>{item}</Text>
          </View>
        ))}
      </RadioButton.Group>

      <TextInput
        label="Additional Comments (Optional)"
        value={comments}
        onChangeText={setComments}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.commentsInput}
        placeholder="Add any additional details..."
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 16,
  },
  commentsInput: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FF3B30",
    padding: 16,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#34C759",
    padding: 16,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default ReportRiderPage;
