import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { TextInput, Button, Card, Title } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";

const GetVerified = () => {
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseImage, setLicenseImage] = useState(null);
  const [orCr, setOrCr] = useState(null);
  const [tplInsurance, setTplInsurance] = useState(null);
  const [brgyClearance, setBrgyClearance] = useState(null);
  const [policeClearance, setPoliceClearance] = useState(null);
  const [nbiClearance, setNbiClearance] = useState(null);
  const [motorPlateNumber, setMotorPlateNumber] = useState("");

  const pickImage = async (setImage) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Title>Verify Your Account</Title>
        <TextInput
          label="License Number"
          value={licenseNumber}
          onChangeText={(text) => setLicenseNumber(text)}
          style={styles.input}
          labelStyle={styles.buttonText}
        />
        <Button
          mode="outlined"
          onPress={() => pickImage(setLicenseImage)}
          style={styles.uploadButton}
          labelStyle={styles.buttonText}
        >
          {licenseImage ? "Image Added" : "Add License Image"}
        </Button>
        <Button
          mode="outlined"
          onPress={() => pickImage(setOrCr)}
          style={styles.uploadButton}
          labelStyle={styles.buttonText}
        >
          {orCr ? "Image Added" : "Add OR CR"}
        </Button>
        <Button
          mode="outlined"
          onPress={() => pickImage(setTplInsurance)}
          style={styles.uploadButton}
          labelStyle={styles.buttonText}
        >
          {tplInsurance ? "Image Added" : "Add TPL Insurance"}
        </Button>
        <Button
          mode="outlined"
          onPress={() => pickImage(setBrgyClearance)}
          style={styles.uploadButton}
          labelStyle={styles.buttonText}
        >
          {brgyClearance ? "Image Added" : "Add Brgy Clearance"}
        </Button>
        <Button
          mode="outlined"
          onPress={() => pickImage(setPoliceClearance)}
          style={styles.uploadButton}
          labelStyle={styles.buttonText}
        >
          {policeClearance ? "Image Added" : "Add Police Clearance"}
        </Button>
        <Button
          mode="outlined"
          onPress={() => pickImage(setNbiClearance)}
          style={styles.uploadButton}
          labelStyle={styles.buttonText}
        >
          {nbiClearance ? "Image Added" : "Add NBI Clearance"}
        </Button>
        <TextInput
          label="Motor with Plate Number"
          value={motorPlateNumber}
          onChangeText={(text) => setMotorPlateNumber(text)}
          style={styles.input}
        />
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => console.log("Cancelled")}
            style={[styles.button, styles.cancelButton]}
            buttonColor="red"
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={() => console.log("Confirmed")}
            style={[styles.button, styles.confirmButton]}
            buttonColor="green"
          >
            Confirm
          </Button>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    padding: 20,
    backgroundColor: "#FFC533",
  },
  input: {
    marginVertical: 10,
  },
  uploadButton: {
    marginVertical: 10,
    backgroundColor: "white",
    borderColor: "black",
  },
  buttonText: {
    color: "black", // This makes the text color black
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "red",
  },
  confirmButton: {
    backgroundColor: "green",
  },
});

export default GetVerified;
