import React, { useState, useEffect, useCallback } from "react";
import { ImageBackground, StyleSheet, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { TextInput, Text } from "react-native-paper";
import { BlurView } from "expo-blur";
import userService from "../../services/auth&services";
import { useAuth } from "../../services/useAuth";

const SubmitFeedback_C = ({ navigation, route }) => {
  const [bookDetails, setBookDetails] = useState(null);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [user_id, setUserId] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const role = "Customer";

  const { userId, userRole } = useAuth();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await userService.getUserId();
        const id = parseInt(response, 10);
        setUserId(id);
      } catch (error) {
        console.error("Error fetching user_id:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUserId();
  }, []);

  const fetchLatestRide = useCallback(async () => {
    setIsLoading(true);
    try {
      const ride = await userService.checkActiveBook();
      setBookDetails(ride.rideDetails);
      console.log("FEEDBACK", ride.rideDetails)
      setIsLoading(false);
    } catch (error) {
      Alert.alert("Error", "Failed to retrieve the latest available ride.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestRide();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading ride details...</Text>
      </View>
    );
  }

  const completeRide = async () => {
    setIsLoading(true);
    try {
      const response = await userService.review_ride(bookDetails.ride_id);
      if (response.data && response.data.message) {
        Alert.alert("Ride Complete", response.data.message);
        navigation.navigate("Home", { havePakyaw: false });
      } else {
        Alert.alert("Error", "Failed to finish the ride. Please try again.");
      }
    } catch (error) {
      console.error("Failed to finish ride", error.response ? error.response.data : error.message);
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  

  const onSubmit = async () => {
    const senderId = role === "Customer" ? bookDetails.user_id : bookDetails.rider_id;
    const recipientId = role === "Customer" ? bookDetails.rider_id : bookDetails.user_id;
  
    if (!rating || rating < 1) {
      Alert.alert(
        "Invalid Rating",
        "Please select a rating between 1 and 5 stars before submitting.",
        [{ text: "OK" }]
      );
      return;
    }
  
    try {
      setIsSubmitting(true);

      const feedbackData = {
        sender: senderId,
        ride_id: bookDetails.ride_id,
        recipient: recipientId,
        rating,
        message,
      }
  
      const response = await userService.submitFeedback(feedbackData);

      console.log(response)


      if (response.message === "You have already submitted feedback for this ride"){
        Alert.alert(
          "Already Submitted",
          response.message,
          [
            {
              text: "OK",
              onPress: () => completeRide()
            }
          ]
        );
      }

      if (response.message === "Feedback submitted successfully"){
        Alert.alert(
          "Success",
          "Thank you for your feedback!",
          [
            {
              text: "OK",
              onPress: () => completeRide()
            }
          ]
        );
      }
  
      
    } catch (error) {
      // let alertTitle = "Error";
      // let alertMessage = "An unexpected error occurred. Please try again.";
  
      // switch (error.status) {
      //   case 400:
      //     if (error.message.includes("already submitted")) {
      //       alertTitle = "Already Submitted";
      //       alertMessage = "You have already provided feedback for this ride.";
      //     }
      //     break;
      //   case 422:
      //     alertTitle = "Invalid Input";
      //     alertMessage = "Please check your feedback details and try again.";
      //     break;
      //   case 404:
      //     alertTitle = "Not Found";
      //     alertMessage = "The ride information could not be found.";
      //     break;
      //   case 500:
      //     alertTitle = "Server Error";
      //     alertMessage = "There was a problem with the server. Please try again later.";
      //     break;
      // }
  
      Alert.alert("Somethin went wrong!", "Please Try Again Later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const recipientLabel = role === "Customer" ? "Rider" : "Customer";
  const recipientName =
    bookDetails && bookDetails.rider
      ? `${bookDetails.rider.first_name || ""} ${bookDetails.rider.last_name || ""}`
      : role === "Customer"
      ? "Loading"
      : bookDetails && bookDetails.user
      ? `${bookDetails.user.first_name || ""} ${bookDetails.user.last_name || ""}`
      : "Loading";

  return (
    <ImageBackground
      source={require("../../pictures/4.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <BlurView intensity={800} tint="light" style={styles.contentContainer}>
          <Text style={styles.title}>Rate Your Experience</Text>
          
          <View style={styles.inputContainer}>
            {/* <TextInput
              label={recipientLabel}
              value={recipientName}
              editable={false}
              style={styles.textinput}
              mode="outlined"
            /> */}
            <TextInput
              label="Date"
              value={bookDetails ? `${bookDetails.ride_date}` : "Loading..."}
              editable={false}
              style={styles.textinput}
              mode="outlined"
            />
          </View>

          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Rating:</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.star}
                >
                  <Text style={[
                    styles.starText,
                    { color: star <= rating ? "#FFD700" : "#C0C0C0" }
                  ]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TextInput
            placeholder="Write your feedback here..."
            style={styles.messageInput}
            mode="outlined"
            label="Message"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.confirmButton,
                isSubmitting && styles.disabledButton
              ]} 
              onPress={onSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? "Submitting..." : "Confirm"}
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  contentContainer: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    width: "100%",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  textinput: {
    backgroundColor: "white",
    marginBottom: 12,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  messageInput: {
    backgroundColor: "white",
    marginTop: 20,
    marginBottom: 20,
    height: 100,
  },
  ratingContainer: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  stars: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  star: {
    padding: 8,
  },
  starText: {
    fontSize: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FF3B30",
    padding: 16,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
  },
  confirmButton: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#333",
  },
});

export default SubmitFeedback_C;