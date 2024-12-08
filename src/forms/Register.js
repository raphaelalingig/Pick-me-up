import React, { useState, memo, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ToastAndroid,
} from "react-native";
import {
  TextInput,
  Text,
  Button,
  Keyboard,
  HelperText,
  Portal,
  Modal,
} from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import userService from "../services/auth&services";
import axios from "axios";
import API_URL from "../services/api_url";
// Add this import at the top of your file
import zxcvbn from 'zxcvbn';

// Inside the SecondForm component, add this function
const getPasswordStrength = (password) => {
  const result = zxcvbn(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Average', 'Strong', 'Very Strong'];
  const strengthColors = [
    "#FF6B6B",
    "#FFA06B",
    "#ffa500",
    "#6BFF6B",
    "#00FF00",
  ];
  
  return {
    score: result.score,
    label: strengthLabels[result.score],
    color: strengthColors[result.score]
  };
};

const FirstForm = memo(
  ({
    first_name,
    setFirstName,
    last_name,
    setLastName,
    user_name,
    setUsername,
    setCurrentForm,
    date_of_birth,
    showDatePicker,
    setShowDatePicker,
    onDateChange,
    datePickerRef,
    gender,
    setGender,
    userType,
    setUserType,
    errors, // Add errors prop
    isLegalAge,
    setIsLegalAge,
    ageError,
    setAgeError,
    handleUserTypeChange,
  }) => (
    <View style={styles.formContainer}>
      <View style={{ width: "100%" }}>
        <Text variant="bodyLarge" style={styles.labels}>
          Name
        </Text>
        <View style={{ gap: 10 }}>
          <View>
            <TextInput
              placeholder="First Name"
              mode="outlined"
              value={first_name}
              onChangeText={setFirstName}
              outlineStyle={[
                styles.textinputs,
                errors.first_name && styles.errorInput,
              ]}
            />
            {errors.first_name && (
              <HelperText type="error" visible={true}>
                {errors.first_name[0]}
              </HelperText>
            )}
          </View>
          <View>
            <TextInput
              placeholder="Last Name"
              mode="outlined"
              value={last_name}
              onChangeText={setLastName}
              outlineStyle={[
                styles.textinputs,
                errors.last_name && styles.errorInput,
              ]}
            />
            {errors.last_name && (
              <HelperText type="error" visible={true}>
                {errors.last_name[0]}
              </HelperText>
            )}
          </View>
        </View>
      </View>

      <View>
        <Text variant="bodyLarge" style={styles.labels}>
          Username
        </Text>
        <TextInput
          mode="outlined"
          value={user_name}
          onChangeText={setUsername}
          outlineStyle={[
            styles.textinputs,
            errors.user_name && styles.errorInput,
          ]}
        />
        {errors.user_name && (
          <HelperText type="error" visible={true}>
            {errors.user_name[0]}
          </HelperText>
        )}
      </View>

      <View>
        <Text variant="bodyLarge" style={styles.labels}>
          User Type
        </Text>
        <View
          style={[styles.pickerContainer, errors.role_id && styles.errorInput]}
        >
          <Picker selectedValue={userType} onValueChange={handleUserTypeChange}>
            <Picker.Item label="Select User Type" value="" />
            <Picker.Item label="Customer" value="Customer" />
            <Picker.Item label="Rider" value="Rider" />
          </Picker>
        </View>
        {errors.role_id && (
          <HelperText type="error" visible={true}>
            {errors.role_id[0]}
          </HelperText>
        )}
      </View>

      <View>
        <Text variant="bodyLarge" style={styles.labels}>
          Select Birth Date
        </Text>
        <Button
          onPress={() => setShowDatePicker(true)}
          mode="outlined"
          style={[
            styles.datePickerButton,
            errors.date_of_birth && styles.errorInput,
          ]}
          labelStyle={{ color: "#000" }}
        >
          <Text>
            {date_of_birth
              ? date_of_birth.toDateString()
              : "Select date of birth"}
          </Text>
        </Button>
        {errors.date_of_birth && (
          <HelperText type="error" visible={true}>
            {errors.date_of_birth[0]}
          </HelperText>
        )}
        {showDatePicker && (
          <DateTimePicker
            ref={datePickerRef}
            value={date_of_birth}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        {date_of_birth && (
          <Text style={{ color: isLegalAge ? "green" : "red" }}>
            {!userType
              ? "Please select a user type"
              : isLegalAge
              ? "Eligible"
              : userType === "Customer"
              ? "Must be 15 years or older"
              : "Must be 18 years or older"}
          </Text>
        )}
      </View>

      <View>
        <Text variant="bodyLarge" style={styles.labels}>
          Gender
        </Text>
        <View
          style={[styles.pickerContainer, errors.gender && styles.errorInput]}
        >
          <Picker
            selectedValue={gender}
            onValueChange={(value) => setGender(value)}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
          </Picker>
        </View>
        {errors.gender && (
          <HelperText type="error" visible={true}>
            {errors.gender[0]}
          </HelperText>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity>
          <Button
            style={styles.button}
            onPress={() => {
              // Clear errors when moving to next form
              setCurrentForm("second");
            }}
            mode="contained"
            disabled={isLegalAge ? false : true}
          >
            <Text>Next</Text>
          </Button>
        </TouchableOpacity>
      </View>
    </View>
  )
);
const SecondForm = memo(
  ({
    setCurrentForm,
    email,
    setEmail,
    handleRegistration,
    loading,
    password,
    setPassword,
    repassword,
    setRepassword,
    mobile_number,
    setMobileNumber,
    errors,
    validateEmail,
    setEmailError,
    emailError,
    mobileError,
    setMobileError,
    validateMobileNumber,
    isVerificationModalVisible,
    setVerificationModalVisible,
    isEmailVerified,
    setIsEmailVerified,
    verificationLoading,
    setVerificationLoading,
    verificationError,
    setVerificationError,
    verificationCode,
    setVerificationCode,
    showToast,
  }) => {
    const sendVerificationCode = async () => {
      if (!email || emailError) {
        showToast("Please enter a valid email address");
        return;
      }

      try {
        setVerificationLoading(true);

        // Complete API endpoint for the request
        const response = await axios.post(`${API_URL}send-verification-code`, {
          email,
        });

        // Explicit check for successful response
        if (response.status === 200) {
          console.log("Verification Code Response:", response.data);
          setVerificationModalVisible(true);
          showToast(
            response.data.message || "Verification code sent to your email"
          );
        } else {
          throw new Error("Unexpected response status");
        }
      } catch (error) {
        console.error("Verification Code Error:", error);

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to send verification code";

        showToast(errorMessage);

        // Additional debug information
        if (error.response) {
          // The request was made and the server responded with a status code
          console.error("Error Response Data:", error.response.data);
          console.error("Error Response Status:", error.response.status);
          console.error("Error Response Headers:", error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received:", error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error Message:", error.message);
        }
      } finally {
        setVerificationLoading(false);
      }
    };

    const verifyEmailCode = async () => {
      try {
        setVerificationLoading(true);

        // Complete API endpoint for verifying email code
        const response = await axios.post(`${API_URL}verify-email-code`, {
          email,
          verification_code: verificationCode,
        });

        if (response.data.email_verified) {
          setIsEmailVerified(true);
          setVerificationModalVisible(false);
          showToast("Email verified successfully");
          setVerificationError("");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Invalid verification code";
        setVerificationError(errorMessage);
        setIsEmailVerified(false);
      } finally {
        setVerificationLoading(false);
      }
    };

    return (
      <View style={styles.formContainer}>
        <View>
          <Text variant="bodyLarge" style={styles.labels}>
            Mobile Number
          </Text>
          <TextInput
            placeholder="Phone Number"
            mode="outlined"
            value={mobile_number}
            onChangeText={validateMobileNumber}
            outlineStyle={[
              styles.textinputs,
              (mobileError || errors.mobile_number) && styles.errorInput,
            ]}
            keyboardType="phone-pad"
            maxLength={11}
          />
          {(mobileError || errors.mobile_number) && (
            <HelperText type="error" visible={true}>
              {mobileError || errors.mobile_number[0]}
            </HelperText>
          )}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text variant="bodyLarge" style={styles.labels}>
              Email
            </Text>
            <TextInput
              placeholder="Email Address"
              mode="outlined"
              value={email}
              onChangeText={validateEmail}
              outlineStyle={[
                styles.textinputs,
                (emailError || errors.email) && styles.errorInput,
              ]}
              keyboardType="email-address"
              autoCapitalize="none"
              type="email"
              disabled={isEmailVerified}
            />
            {(emailError || errors.email) && (
              <HelperText type="error" visible={true}>
                {emailError || errors.email[0]}
              </HelperText>
            )}
          </View>
          <Button
            mode="contained"
            onPress={sendVerificationCode}
            loading={verificationLoading}
            disabled={!email || !!emailError || isEmailVerified}
            style={{ marginTop: 20 }}
          >
            {isEmailVerified ? "✓" : "Send Code"}
          </Button>
        </View>

        {/* Email Verification Modal */}
        <Portal>
          <Modal
            visible={isVerificationModalVisible}
            onDismiss={() => setVerificationModalVisible(false)}
            contentContainerStyle={{
              backgroundColor: "white",
              padding: 24,
              marginHorizontal: 16,
              marginVertical: 32,
              borderRadius: 12,
              elevation: 6, // Shadow for Android
              shadowColor: "#000", // Shadow for iOS
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              maxWidth: 400,
              width: "100%",
              alignSelf: "center",
            }}
          >
            <View className="space-y-6">
              {/* Title */}
              <Text className="text-2xl font-bold text-center text-black">
                Verification Required
              </Text>

              {/* Description */}
              <Text className="text-center text-gray-600 text-sm">
                Please enter the 6-digit code sent to your email.
              </Text>

              {/* Input */}
              <TextInput
                placeholder="000000"
                mode="outlined"
                value={verificationCode}
                onChangeText={setVerificationCode}
                maxLength={6}
                className="text-center text-xl tracking-wider"
                style={{
                  backgroundColor: "white",
                  borderColor: "#FFC533",
                  borderWidth: 2,
                  borderRadius: 8, // Rounded corners
                  paddingVertical: 12,
                }}
              />

              {/* Error Message */}
              {verificationError && (
                <HelperText type="error" visible={true}>
                  <Text className="text-red-500 text-sm">
                    {verificationError}
                  </Text>
                </HelperText>
              )}

              {/* Buttons */}
              <View className="flex flex-row justify-center space-x-3">
                <Button
                  mode="contained"
                  onPress={() => setVerificationModalVisible(false)}
                  className="flex-1"
                  style={{
                    backgroundColor: "#1C1C1E",
                    borderRadius: 8,
                    paddingVertical: 10,
                  }}
                  labelStyle={{
                    color: "white",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Button>

                <Button
                  mode="contained"
                  onPress={verifyEmailCode}
                  loading={verificationLoading}
                  disabled={verificationCode.length !== 6}
                  className="flex-1"
                  style={{
                    backgroundColor: "#FFC533",
                    borderRadius: 8,
                    paddingVertical: 10,
                  }}
                  labelStyle={{
                    color: "#1C1C1E",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  {verificationLoading ? "Verifying..." : "Verify"}
                </Button>
              </View>
            </View>
          </Modal>
        </Portal>

        <View>
          <Text variant="bodyLarge" style={styles.labels}>
            Password
          </Text>
          <View style={{ gap: 10 }}>
            <View>
              <TextInput
                placeholder="Enter Password"
                mode="outlined"
                value={password}
                onChangeText={setPassword}
                outlineStyle={[
                  styles.textinputs,
                  errors.password && styles.errorInput,
                ]}
                secureTextEntry
              />
              {password && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 5,
                  }}
                >
                  <View
                    style={{
                      height: 5,
                      width: `${
                        (getPasswordStrength(password).score + 1) * 20
                      }%`,
                      backgroundColor: getPasswordStrength(password).color,
                      marginRight: 10,
                    }}
                  />
                  <Text
                    style={{
                      color: getPasswordStrength(password).color,
                      fontSize: 12,
                      fontWeight: "bold",
                      textShadowColor: "rgba(0, 0, 0, 0.5)", // Adds shadow to text
                      textShadowOffset: { width: 1, height: 1 },
                      textShadowRadius: 1,
                      borderColor: getPasswordStrength(password).color, // Border matches strength color
                      borderRadius: 5,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    {getPasswordStrength(password).label}
                  </Text>
                </View>
              )}

              {errors.password && (
                <HelperText type="error" visible={true}>
                  {errors.password[0]}
                </HelperText>
              )}
            </View>
            <View>
              <TextInput
                placeholder="Confirm Password"
                mode="outlined"
                value={repassword}
                onChangeText={setRepassword}
                outlineStyle={[
                  styles.textinputs,
                  password !== repassword && styles.errorInput,
                ]}
                secureTextEntry
              />

              {password !== repassword && (
                <HelperText type="error" visible={true}>
                  Passwords do not match
                </HelperText>
              )}
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <View style={{ flexDirection: "row", gap: 5 }}>
            <TouchableOpacity>
              <Button
                style={styles.button}
                onPress={() => setCurrentForm("first")}
                mode="contained"
              >
                <Text>Back</Text>
              </Button>
            </TouchableOpacity>

            <TouchableOpacity>
              <Button
                style={styles.button}
                mode="contained"
                onPress={handleRegistration}
                loading={loading}
                disabled={loading || !isEmailVerified}
              >
                <Text>Submit</Text>
              </Button>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
);

const Register = ({ navigation }) => {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [user_name, setUsername] = useState("");
  const [selectedSex, setSelectedSex] = useState("");
  const [selectedUserType, setSelectedUserType] = useState("");
  const [currentForm, setCurrentForm] = useState("first");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [HideEntry, setHideEntry] = useState(true);
  const [mobile_number, setMobileNumber] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userType, setUserType] = useState("");
  const [errors, setErrors] = useState({});
  const [isLegalAge, setIsLegalAge] = useState(false);
  const [ageError, setAgeError] = useState("");
  const datePickerRef = useRef();
  const [date_of_birth, setDateOfBirth] = useState(new Date());

  const [isVerificationModalVisible, setVerificationModalVisible] =
    useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const showToast = (message = "Something went wrong") => {
    ToastAndroid.showWithGravity(
      message,
      ToastAndroid.LONG,
      ToastAndroid.CENTER
    );
  };

  const handleRegistration = async () => {
    try {
      if (!isEmailVerified) {
        showToast("Email is not verified");
        return;
      }
      setLoading(true);
      setErrors({});

      // Check if all required fields are filled
      if (
        user_name === "" ||
        first_name === "" ||
        last_name === "" ||
        gender === "" ||
        date_of_birth === "" ||
        email === "" ||
        password === "" ||
        mobile_number === "" ||
        userType === ""
      ) {
        showToast("Please input required data");
        setIsError(true);
        setLoading(false);
        return;
      }

      // Check if passwords match
      if (password !== repassword) {
        showToast("Passwords do not match");
        setIsError(true);
        setLoading(false);
        return;
      }

      // Convert userType to role_id
      const roleId = userType === "Customer" ? 4 : 3; // Customer = 4, Rider = 3

      const userData = {
        user_name,
        first_name,
        last_name,
        gender,
        date_of_birth: date_of_birth.toISOString().split("T")[0],
        email,
        password,
        password_confirmation: repassword,
        role_id: roleId,
        mobile_number,
      };

      console.log("Request Payload:", userData); // Debugging

      const response = await userService.signup(userData);

      console.log("Response:", response); // Debugging

      showToast("Registration successful");

      if (Keyboard && Keyboard.dismiss) {
        Keyboard.dismiss();
      }

      setTimeout(() => {
        navigation.replace("Login");
      }, 1000);

      resetForm();
    } catch (error) {
      if (error.response?.status === 422) {
        // Handle validation errors quietly, without extra console logging
        setErrors(error.response.data.errors || {});
        const firstError = Object.values(error.response.data.errors)[0];
        if (firstError && firstError[0]) {
          showToast(firstError[0]);
        }
      } else {
        // Log and handle unexpected errors only
        console.error("Unexpected registration error:", error.message);
        showToast("An unexpected error occurred during registration.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUsername("");
    setFirstName("");
    setLastName("");
    setGender("");
    setDateOfBirth(new Date());
    setEmail("");
    setPassword("");
    setRepassword("");
    setMobileNumber("");
    setIsError(false);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date_of_birth;
    setShowDatePicker(false);

    if (currentDate) {
      // Calculate age
      const today = new Date();
      const birthDate = new Date(currentDate);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      // Adjust age if birthday hasn't occurred this year
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      // Update date
      setDateOfBirth(currentDate);

      // Check age requirements based on user type
      if (!userType) {
        setIsLegalAge(false);
      } else if (userType === "Customer") {
        setIsLegalAge(age >= 15); // Changed from 12 to 15
      } else if (userType === "Rider") {
        setIsLegalAge(age >= 18);
      }
    }
  };

  const handleUserTypeChange = (itemValue) => {
    setUserType(itemValue);

    if (date_of_birth) {
      const today = new Date();
      const birthDate = new Date(date_of_birth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (itemValue === "Customer") {
        setIsLegalAge(age >= 15); // Changed from 12 to 15
      } else if (itemValue === "Rider") {
        setIsLegalAge(age >= 18);
      }
    }
  };

  const validateEmail = (text) => {
    // Regular expression for basic email validation
    const emailRegex =
      /^[^\s@]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/i;

    // Update email state
    setEmail(text);

    // Validate email
    if (!text) {
      setEmailError("Email is required");
    } else if (!emailRegex.test(text)) {
      setEmailError(
        "Please enter a valid email address with gmail.com, yahoo.com, outlook.com, or hotmail.com domain"
      );
    } else {
      setEmailError("");
    }
  };
  const validateMobileNumber = (text) => {
    // Remove any non-digit characters
    const phoneNumber = text.replace(/[^0-9]/g, "");

    // Limit to 11 digits
    if (phoneNumber.length <= 11) {
      setMobileNumber(phoneNumber);
    }

    // Validate length
    if (phoneNumber.length === 0) {
      setMobileError("Mobile number is required");
    } else if (phoneNumber.length < 11) {
      setMobileError("Mobile number must be 11 digits");
    } else if (phoneNumber.length > 11) {
      setMobileError("Mobile number cannot exceed 11 digits");
    } else {
      setMobileError("");
    }
  };
  return (
    <ImageBackground
      source={require("../pictures/PMU_Rider_Back.png")}
      style={styles.background}
      blurRadius={3}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.containerForms}>
          <View style={{ marginBottom: 20 }}>
            <Text
              variant="titleLarge"
              style={{ fontWeight: "bold", color: "black" }}
            >
              Create an Account
            </Text>
            <Text
              variant="titleMedium"
              style={{ fontWeight: "semiBold", color: "black" }}
            >
              Welcome! Please enter your details
            </Text>
          </View>

          {currentForm === "first" ? (
            <FirstForm
              first_name={first_name}
              setFirstName={setFirstName}
              last_name={last_name}
              setLastName={setLastName}
              user_name={user_name}
              setUsername={setUsername}
              selectedSex={selectedSex}
              setSelectedSex={setSelectedSex}
              selectedUserType={selectedUserType}
              setSelectedUserType={setSelectedUserType}
              setCurrentForm={setCurrentForm}
              date_of_birth={date_of_birth}
              setDateOfBirth={setDateOfBirth}
              showDatePicker={showDatePicker}
              setShowDatePicker={setShowDatePicker}
              onDateChange={onDateChange}
              datePickerRef={datePickerRef}
              gender={gender}
              setGender={setGender}
              email={email}
              setEmail={setEmail}
              showToast={showToast}
              isError={isError}
              loading={loading}
              HideEntry={HideEntry}
              setHideEntry={setHideEntry}
              mobile_number={mobile_number}
              setMobileNumber={setMobileNumber}
              userType={userType}
              setUserType={setUserType}
              errors={errors}
              isLegalAge={isLegalAge}
              setIsLegalAge={setIsLegalAge}
              ageError={ageError}
              setAgeError={setAgeError}
              handleUserTypeChange={handleUserTypeChange}
            />
          ) : (
            <SecondForm
              setCurrentForm={setCurrentForm}
              email={email}
              setEmail={setEmail}
              showToast={showToast}
              loading={loading}
              isError={isError}
              repassword={repassword}
              setRepassword={setRepassword}
              password={password}
              setPassword={setPassword}
              mobile_number={mobile_number}
              setMobileNumber={setMobileNumber}
              user_name={user_name}
              setUsername={setUsername}
              selectedUserType={selectedUserType}
              setSelectedUserType={setSelectedUserType}
              date_of_birth={date_of_birth}
              setDateOfBirth={setDateOfBirth}
              gender={gender}
              setGender={setGender}
              first_name={first_name}
              setFirstName={setFirstName}
              last_name={last_name}
              setLastName={setLastName}
              handleRegistration={handleRegistration}
              errors={errors}
              validateEmail={validateEmail}
              emailError={emailError}
              setEmailError={setEmailError}
              setMobileError={setMobileError}
              mobileError={mobileError}
              validateMobileNumber={validateMobileNumber}
              isVerificationModalVisible={isVerificationModalVisible}
              setVerificationModalVisible={setVerificationModalVisible}
              isEmailVerified={isEmailVerified}
              setIsEmailVerified={setIsEmailVerified}
              verificationLoading={verificationLoading}
              setVerificationLoading={setVerificationLoading}
              verificationError={verificationError}
              setVerificationError={setVerificationError}
              setVerificationCode={setVerificationCode}
              verificationCode={verificationCode}
            />
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  containerForms: {
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderColor: "rgba(255,255,255,0.25)",
    borderWidth: 1,
    borderRadius: 10,
  },
  textinputs: {
    borderRadius: 15,
    backgroundColor: "white",
    width: "100%",
  },
  labels: {
    marginBottom: 5,
    fontWeight: "bold",
  },
  formContainer: {
    width: 350,
    flexDirection: "column",
    gap: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#FFC533",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  errorInput: {
    borderColor: "red",
    borderWidth: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
    marginTop: 5,
  },
});

export default Register;
