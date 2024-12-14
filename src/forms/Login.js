// Login.js (updated)
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import { Button, Text, Dialog, Portal } from "react-native-paper";
import { useAuth } from "../services/useAuth";
import userService from "../services/auth&services";
import CustomIconInput from "./CustomIconInput";
import * as Location from "expo-location";
import Toast from "react-native-root-toast";
import Ionicons from "@expo/vector-icons/Ionicons";

const Login = ({ navigation }) => {
  const [user_name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [token, setToken] = useState("");
  const { login } = useAuth();
  const [hideEntry, setHideEntry] = useState(true);
  const [user, setUser] = useState("");
  const [status, setStatus] = useState(null);

  const showToast = (message = "Something went wrong") => {
    ToastAndroid.showWithGravity(
      message,
      ToastAndroid.LONG,
      ToastAndroid.CENTER
    );
  };

  const getCurrentLocation = async (role) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        console.log("Location fetched successfully:", location);

        // Update rider status and location
        await userService.updateRiderStatusAndLocation({
          longitude: location.coords.longitude,
          latitude: location.coords.latitude,
          status: "Available",
        });
        
        console.log("Location updated successfully in the database");
      } else {
        console.error("Location permission not granted");
        setError("Location permission is required to proceed.");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      setError("An error occurred while fetching location.");
    }
  };

  const handleLogin = async () => {
    if (!user_name || !password) {
      showToast("Please input required credentials");
      return;
    }

    setIsLoading(true);

    try {
      const {
        token: receivedToken,
        role,
        user_id,
        status: userStatus,
      } = await userService.login(user_name, password);
      console.log("login", receivedToken);

      setToken(receivedToken);
      setUser(user_id);
      setStatus(userStatus);

      if (role === 3 || role === 1 || role === 2) {
        await login(receivedToken, role, user_id, userStatus);
        Toast.show("Logged In Successfully", {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          hideOnPress: true,
          backgroundColor: "#333",
          textColor: "#fff",
        });
        const locationSuccess = await getCurrentLocation(role);
        if (locationSuccess) {
          navigation.replace("RiderStack");
        }
      } else if (role === 4) {
        await login(receivedToken, role, user_id, userStatus);
        navigation.replace("CustomerStack");
      } else {
        showToast("An error occurred during login");
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          showToast("Incorrect username or password");
        } else if (err.response.status === 404) {
          showToast("Username and Password do not match");
        } else if (err.response.status === 403) {
          showToast(
            err.response.data?.message ||
              "Your account is already logged in on another device."
          );
        } else {
          showToast(
            err.response.data?.message || "An error occurred during login"
          );
        }
      } else if (err.request) {
        showToast("Network error, please try again later");
      } else {
        showToast("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // const handleRoleSelection = async (role) => {
  //   await login(token, role, user, status);
  //   setShowDialog(false);
  //   navigation.replace(role === 3 ? "RiderStack" : "CustomerStack");
  // };

  const toggleSecureEntry = () => {
    setHideEntry(!hideEntry);
  };

  return (
    <ImageBackground
      source={require("../pictures/PMU_Rider_Back.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>PICKME UP</Text>
          <Text style={styles.subtitle}>Pick you up wherever you are</Text>
        </View>
        <View style={{ marginTop: "50%" }}>
          <CustomIconInput
            placeholder="Username"
            value={user_name}
            onChangeText={setUsername}
            theme={{
              colors: {
                primary: "black",
                outline: "black",
              },
            }}
          />
          <CustomIconInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={hideEntry}
            iconName={hideEntry ? "eye-off" : "eye"}
            onIconPress={toggleSecureEntry}
            theme={{
              colors: {
                primary: "black",
                outline: "black",
              },
            }}
          />

          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.forgotcontainercontainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <Button
            mode="contained"
            style={styles.button}
            labelStyle={styles.buttonText}
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Register Here</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* <Portal>
          <Dialog
            visible={showDialog}
            onDismiss={() => setShowDialog(false)}
            style={styles.dialog}
          >
            <Dialog.Title style={styles.dialogTitle}>Select Role</Dialog.Title>
            <Dialog.Content>
              <Button
                mode="contained"
                style={styles.dialogButton}
                onPress={() => handleRoleSelection(3)}
              >
                Rider
              </Button>
              <Button
                mode="contained"
                style={styles.dialogButton}
                onPress={() => handleRoleSelection(4)}
              >
                Customer
              </Button>
            </Dialog.Content>
          </Dialog>
        </Portal> */}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
    backgroundColor: "black",
    paddingVertical: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFC533",
  },
  subtitle: {
    fontSize: 16,
    color: "#FFC533",
  },
  input: {
    marginBottom: 20,
  },
  forgotcontainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
  },
  forgotPasswordLink: {
    color: "#D4A017",
    textDecorationLine: "underline",
  },
  button: {
    marginTop: 20,
    padding: 5,
    backgroundColor: "#000",
  },
  buttonText: {
    color: "#FFC533",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    padding: 10,
    backgroundColor: "#000",
    borderRadius: 10,
  },
  registerText: {
    color: "#fff",
  },
  registerLink: {
    color: "#FFC533",
    textDecorationLine: "underline",
  },
  error: {
    color: "red",
    fontWeight: "bold",
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
  },
  iconContainer: {
    position: "absolute",
    right: 0,
    padding: 25,
  },
  dialog: {
    backgroundColor: "#000",
    borderRadius: 10,
  },
  dialogTitle: {
    color: "#FFC533",
  },
  dialogButton: {
    marginTop: 10,
    backgroundColor: "#FFC533",
    color: "#000",
  },
});

export default Login;
