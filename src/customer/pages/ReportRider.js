import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { TextInput, Text, RadioButton } from "react-native-paper";
import userService from "../../services/auth&services";

const ReportRiderPage = ({ navigation, route }) => {
  const { ride, role } = route.params;
  const [bookDetails, setBookDetails] = useState("");
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [user_id, setUserId] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log(ride)

  const reasons = [
    "Rider was rude",
    "Reckless driving",
    "Overcharging",
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

  const fetchLatestRide = useCallback(async () => {
    // setIsLoading(true);
    try {
      const ride = await userService.checkActiveBook();
      setBookDetails(ride.rideDetails);
      console.log("FEEDBACK", ride.rideDetails)
      // setIsLoading(false);
    } catch (error) {
      Alert.alert("Error", "Failed to retrieve the latest available ride.");
      // setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestRide();
  }, []);

  const handleSubmit = async () => {
    const senderId = role === "Customer" ? bookDetails.user_id : bookDetails.rider_id;
    const recipientId = role === "Customer" ? bookDetails.rider_id : bookDetails.user_id;

    if (!reason) {
      Alert.alert("Missing Reason", "Please select a reason for reporting.");
      return;
    }

    try {
      setIsSubmitting(true);

      const reportData = {
        sender: senderId,
        ride_id: bookDetails.ride_id,
        recipient: recipientId,
        reason,
        comments,
      };

      console.log("Submitting report:", reportData);
      const response = await userService.submitReport(reportData);

      if (response.message === "You have already submitted a report for this ride") {
        Alert.alert("Already Submitted", response.message, [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
        return;
      }

      if (response.message === "Feedback submitted successfully") {
        Alert.alert("Success", "Thank you for your feedback!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const riderName = 
  
  bookDetails?.rider
    ? `${bookDetails.rider.first_name || ""} ${bookDetails.rider.last_name || ""}`
    : "";

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Report Rider</Text>
        <Text style={styles.riderName}>{riderName}</Text>
        <Text style={styles.subtitle}>Why are you reporting this rider?</Text>

        <RadioButton.Group
          onValueChange={(value) => setReason(value)}
          value={reason}
        >
          {reasons.map((item, index) => (
            <View style={styles.radioItem} key={index}>
              <RadioButton value={item} color="#FFD700" />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f2f2f2",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  riderName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#666",
    marginBottom: 10,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 16,
    color: "#444",
  },
  commentsInput: {
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    borderColor: "#ddd",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#34C759",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default ReportRiderPage;