import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useAuth } from "../services/useAuth";
import userService from "../services/auth&services";

const Login = ({ navigation }) => {
  const [user_name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);
  
    try {
      const { token, role } = await userService.login(user_name, password);
  
      if (role === 3) {
        login(token, role);
        navigation.navigate("RiderHome");
      } else if (role === 4) {
        login(token, role);
        navigation.navigate("CustomerHome");
      } else {
        setError("An error occurred during login");
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError("Please Input required credentials");
        } else if (err.response.status === 404) {
          setError("Username and Password do not match");
        } else {
          setError(err.response.data?.message || "An error occurred during login");
        }
      } else if (err.request) {
        setError("Network error, please try again later");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
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

        <TextInput
          style={styles.input}
          label="Username"
          value={user_name}
          onChangeText={setUsername}
          mode="outlined"
        />

        <TextInput
          style={styles.input}
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          mode="contained"
          style={styles.button}
          labelStyle={styles.buttonText}
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLink}>Register Here</Text>
          </TouchableOpacity>
        </View>
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
  },
  registerText: {
    color: "#fff",
  },
  registerLink: {
    color: "#0000EE",
    textDecorationLine: "underline",
  },
  error: {
    color: "red",
    fontWeight: "bold",
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
  },

});

export default Login;
