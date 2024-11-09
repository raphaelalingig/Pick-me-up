import React, { useState, memo, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { TextInput, Text, Button, Keyboard, HelperText } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-root-toast";
import userService from "../services/auth&services";

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
  }) => (
    <Animated.View
      entering={FadeInRight}
      exiting={FadeOutLeft}
      style={styles.formContainer}
    >
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
                errors.first_name && styles.errorInput
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
                errors.last_name && styles.errorInput
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
            errors.user_name && styles.errorInput
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
          Select Birth Date
        </Text>
        <Button
          onPress={() => setShowDatePicker(true)}
          mode="outlined"
          style={[
            styles.datePickerButton,
            errors.date_of_birth && styles.errorInput
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
      </View>

      <View>
        <Text variant="bodyLarge" style={styles.labels}>
          Gender
        </Text>
        <View style={[
          styles.pickerContainer,
          errors.gender && styles.errorInput
        ]}>
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

      <View>
        <Text variant="bodyLarge" style={styles.labels}>
          User Type
        </Text>
        <View style={[
          styles.pickerContainer,
          errors.role_id && styles.errorInput
        ]}>
          <Picker
            selectedValue={userType}
            onValueChange={(itemValue) => setUserType(itemValue)}
          >
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

      <View style={styles.buttonContainer}>
        <TouchableOpacity>
          <Button
            style={styles.button}
            onPress={() => {
              // Clear errors when moving to next form
              setCurrentForm("second");
            }}
            mode="contained"
          >
            <Text>Next</Text>
          </Button>
        </TouchableOpacity>
      </View>
    </Animated.View>
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
  }) => (
    <Animated.View
      entering={FadeInRight}
      exiting={FadeOutLeft}
      style={styles.formContainer}
    >
      <View>
        <Text variant="bodyLarge" style={styles.labels}>
          Mobile Number
        </Text>
        <TextInput
          placeholder="Phone Number"
          mode="outlined"
          value={mobile_number}
          onChangeText={setMobileNumber}
          outlineStyle={[
            styles.textinputs,
            errors.mobile_number && styles.errorInput
          ]}
          keyboardType="phone-pad"
        />
        {errors.mobile_number && (
          <HelperText type="error" visible={true}>
            {errors.mobile_number[0]}
          </HelperText>
        )}
      </View>

      <View>
        <Text variant="bodyLarge" style={styles.labels}>
          Email
        </Text>
        <TextInput
          placeholder="Email Address"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          outlineStyle={[
            styles.textinputs,
            errors.email && styles.errorInput
          ]}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && (
          <HelperText type="error" visible={true}>
            {errors.email[0]}
          </HelperText>
        )}
      </View>

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
                errors.password && styles.errorInput
              ]}
              secureTextEntry
            />
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
                password !== repassword && styles.errorInput
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
              disabled={loading}
            >
              <Text>Submit</Text>
            </Button>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )
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
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [HideEntry, setHideEntry] = useState(true);
  const [mobile_number, setMobileNumber] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userType, setUserType] = useState("");
  const [errors, setErrors] = useState({});

  const datePickerRef = useRef();
  const [date_of_birth, setDateOfBirth] = useState(new Date());

  const showToast = (message = "Something went wrong") => {
    Toast.show(message, { duration: Toast.durations.LONG });
  };

  const handleRegistration = async () => {
    try {
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
    setDateOfBirth(currentDate);
  };

  return (
    <ImageBackground
      source={require("../pictures/PMU_Rider_Back.png")}
      style={styles.background}
      blurRadius={3}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <BlurView intensity={50} style={styles.containerForms}>
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
            />
          )}
        </BlurView>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
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
    borderColor: 'red',
    borderWidth: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
    marginTop: 5,
  },
});

export default Register;
