import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Button } from "react-native-paper";

const Home = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../pictures/Pick-Me-Up-Logo.png")} // Replace with the correct path to your logo image
          style={styles.logo}
        />
      </View>
      <Button
        mode="contained"
        style={styles.button}
        onPress={() => console.log("Start Finding Customer pressed")}
      >
        START FINDING CUSTOMER
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 50,
  },
  logo: {
    width: 150, // Adjust the width as needed
    height: 150, // Adjust the height as needed
    borderRadius: 75, // This will make the image circular if the width and height are equal
    borderWidth: 2,
    borderColor: "blue",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#FFD700", // Button background color
    padding: 10,
  },
  buttonLabel: {
    color: "#000", // Button text color
  },
});

export default Home;
