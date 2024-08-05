import React, { useState, useRef } from "react";
import { View, StyleSheet, Keyboard, Platform } from "react-native";
import { TextInput, Button, Text, Surface, Menu, Provider as PaperProvider } from "react-native-paper";
import { widthPercentageToDP, heightPercentageToDP } from "react-native-responsive-screen";
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import Toast from "react-native-root-toast";
import userService from "../services/auth&services";

const Register = ({ navigation }) => {
  const [userType, setUserType] = useState("");
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const [user_name, setUsername] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [date_of_birth, setDateOfBirth] = useState(new Date());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [HideEntry, setHideEntry] = useState(true);
  const [mobile_number, setMobileNumber] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const datePickerRef = useRef();

  const toggleSecureEntry = () => {
    setHideEntry(!HideEntry);
  };

  const showToast = (message = "Something went wrong") => {
    Toast.show(message, { duration: Toast.durations.LONG });
  };

  const handleRegistration = async () => {
    try {
      setLoading(true);
  
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
        userType === "" // Check if userType is selected
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
        date_of_birth: date_of_birth.toISOString().split('T')[0],
        email,
        password,
        password_confirmation: repassword,
        role_id: roleId,
        mobile_number,
      };
  
      console.log('Request Payload:', userData); // Debugging
  
      const response = await userService.signup(userData);
  
      console.log('Response:', response); // Debugging
  
      showToast("Registration successful");
  
      Keyboard.dismiss();
  
      setTimeout(() => {
        navigation.navigate("Login");
      }, 1000);
  
      resetForm();
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      showToast("An error occurred during registration.");
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
    <PaperProvider>
      <View style={styles.container}>
        <Surface style={styles.surface}>
          <Text style={styles.title}>SIGNUP</Text>

          <TextInput
            label="First Name"
            value={first_name}
            onChangeText={setFirstName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Last Name"
            value={last_name}
            onChangeText={setLastName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Username"
            value={user_name}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
          />
          <RNPickerSelect
            onValueChange={(value) => setGender(value)}
            items={[
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
            ]}
            style={pickerSelectStyles}
            placeholder={{ label: "Select your gender", value: null }}
          />
          <Button
            onPress={() => setShowDatePicker(true)}
            mode="outlined"
            style={styles.datePickerButton}
            labelStyle={{ color: "#000" }}
          >
            {date_of_birth ? date_of_birth.toDateString() : "Select date of birth"}
          </Button>
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
            secureTextEntry={HideEntry}
            mode="outlined"
            style={styles.input}
            right={
              <TextInput.Icon
                name={!HideEntry ? "eye" : "eye-off"}
                onPress={toggleSecureEntry}
              />
            }
          />
          <TextInput
            label="Confirm Password"
            value={repassword}
            onChangeText={setRepassword}
            secureTextEntry={HideEntry}
            mode="outlined"
            style={styles.input}
            right={
              <TextInput.Icon
                name={!HideEntry ? "eye" : "eye-off"}
                onPress={toggleSecureEntry}
              />
            }
          />
          <TextInput
            label="Add Phone Number"
            value={mobile_number}
            onChangeText={setMobileNumber}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
          />

          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
              <Button 
                onPress={openMenu} 
                mode="outlined" 
                style={styles.dropdown}
                labelStyle={styles.buttonText}
              >
                {userType || "Select User Type"}
              </Button>
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item onPress={() => {setUserType("Customer"); closeMenu();}} title="Customer" titleStyle={styles.menuItem} />
            <Menu.Item onPress={() => {setUserType("Rider"); closeMenu();}} title="Rider" titleStyle={styles.menuItem} />
          </Menu>

          <Button
            mode="contained"
            style={styles.button}
            labelStyle={styles.buttonLabel}
            onPress={handleRegistration}
            loading={loading}
            disabled={loading}
          >
            Sign Up
          </Button>
        </Surface>

        <View style={styles.circle} />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  surface: {
    padding: 16,
    width: "100%",
    maxWidth: 400,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    alignSelf: "center",
  },
  input: {
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  datePickerButton: {
    marginBottom: 10,
    borderColor: "#FFC42B",
    borderWidth: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    marginBottom: 10,
    borderColor: "#FFC42B",
    borderWidth: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#FFC42B",
  },
  buttonLabel: {
    color: "black",
    fontWeight: "bold",
  },
  circle: {
    width: 100,
    height: 100,
    backgroundColor: "#FFC42B",
    borderRadius: 50,
    position: "absolute",
    bottom: -50,
    alignSelf: "center",
  },
  menuContent: {
    width: widthPercentageToDP("80%"),
  },
  menuItem: {
    color: "black",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#FFC42B",
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
    width: widthPercentageToDP("80%"),
    marginBottom: heightPercentageToDP("2%"),
    backgroundColor: "#fff",
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "#FFC42B",
    borderRadius: 8,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
    width: widthPercentageToDP("80%"),
    marginBottom: heightPercentageToDP("2%"),
    backgroundColor: "#fff",
  },
});

export default Register;
