import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Image, ToastAndroid } from "react-native";
import { TextInput, Button, Card, Title, Divider } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import userService from "../../services/auth&services";
import * as FileSystem from 'expo-file-system';
const GetVerified = () => {
  const [image, setImage] = useState(null);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpDate, setLicenseExpDate] = useState("");
  const [orExpDate, setOrExpDate] = useState("");
  const [licenseImage, setLicenseImage] = useState(null);
  const [orCr, setOrCr] = useState(null);
  const [tplInsurance, setTplInsurance] = useState(null);
  const [brgyClearance, setBrgyClearance] = useState(null);
  const [policeClearance, setPoliceClearance] = useState(null);
  const [motorPlateNumber, setMotorPlateNumber] = useState("");
  const [motorModel, setMotorModel] = useState(null);

  const showToast = (message = "Something went wrong") => {
    ToastAndroid.show(message, 3000);
  };

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, []);

  const pickImage = async (setImage) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (result.canceled) {
        console.log("Image picker was cancelled");
        return;
      }
  
      let selectedImage;
  
      if (result.assets && result.assets.length > 0) {
        selectedImage = result.assets[0].uri;
      } else if (result.uri) {
        selectedImage = result.uri;
      }
  
      if (selectedImage) {
        setImage(selectedImage);
        console.log("Image selected:", selectedImage);
      } else {
        console.log("No image was selected");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      // You can also use your showToast function here if you want to show an error message to the user
      // showToast("Error picking image");
    }
  };


  const handleSubmit = async () => {
    try {
      const uploadImage = async (imageUri, requirementId) => {
        if (!imageUri) return;

        const formData = new FormData();
        formData.append('requirement_id', requirementId);
        
        const fileInfo = await FileSystem.getInfoAsync(imageUri);
        formData.append('photo', {
          uri: imageUri,
          type: 'image/jpeg',
          name: `requirement_${requirementId}.jpg`,
        });

        const response = await userService.upload(formData);
        
        if (response && response.success) {
          console.log(`Uploaded requirement ${requirementId} successfully`);
        } else {
          throw new Error(`Failed to upload requirement ${requirementId}`);
        }
      };

      // Upload each image with its corresponding requirement ID
      await Promise.all([
        uploadImage(motorModel, 1),
        uploadImage(orCr, 2),
        uploadImage(orCr, 4),
        uploadImage(licenseImage, 5),
        uploadImage(tplInsurance, 8),
        uploadImage(brgyClearance, 9),
        uploadImage(policeClearance, 10),
      ]);

      // Handle non-image data
      const textData = {
        or_expiration_date: orExpDate,
        drivers_license_number: licenseNumber,
        license_expiration_date: licenseExpDate,
        plate_number: motorPlateNumber,
      };
      const updateResponse = await userService.updateRiderInfo(textData);

      if (updateResponse && updateResponse.success) {
        showToast("All documents uploaded and information updated successfully");
      } else {
        throw new Error("Failed to update rider information");
      }
    } catch (error) {
      console.error("Error uploading documents or updating information:", error.message);
      showToast("Error uploading documents or updating information. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Title style={styles.title}>Verify Your Account</Title>
        
        {/* Section: License Details */}
        <Title style={styles.sectionTitle}>License Details</Title>
        <Divider style={styles.divider} />
        <Button
          mode="outlined"
          onPress={() => pickImage(setLicenseImage)}
          style={styles.uploadButton}
          labelStyle={styles.buttonText}
        >
          {licenseImage ? "License Image Added" : "Add License Image"}
        </Button>
        {licenseImage && <Image source={{ uri: licenseImage }} style={styles.imagePreview} />}
        <TextInput
          label="License Number"
          value={licenseNumber}
          onChangeText={(text) => setLicenseNumber(text)}
          style={styles.input}
        />
        <TextInput
          label="License Expiration Date"
          value={licenseExpDate}
          onChangeText={(text) => setLicenseExpDate(text)}
          style={styles.input}
        />

        {/* Section: Vehicle Information */}
        <Title style={styles.sectionTitle}>Vehicle Information</Title>
        <Divider style={styles.divider} />
        <Button
          mode="outlined"
          onPress={() => pickImage(setOrCr)}
          style={styles.uploadButton}
          labelStyle={styles.buttonText}
        >
          {orCr ? "OR CR Image Added" : "Add OR CR"}
        </Button>
        {orCr && <Image source={{ uri: orCr }} style={styles.imagePreview} />}
        <Button
          mode="outlined"
          onPress={() => pickImage(setMotorModel)}
          style={styles.uploadButton}
          labelStyle={styles.buttonText}
        >
          {motorModel ? "Motor Model Image Added" : "Add Motor Model"}
        </Button>
        {motorModel && <Image source={{ uri: motorModel }} style={styles.imagePreview} />}
        <TextInput
          label="OR Expiration Date"
          value={orExpDate}
          onChangeText={(text) => setOrExpDate(text)}
          style={styles.input}
        />
        <TextInput
          label="Motor Plate Number"
          value={motorPlateNumber}
          onChangeText={(text) => setMotorPlateNumber(text)}
          style={styles.input}
        />

        {/* Section: Clearances */}
        <Title style={styles.sectionTitle}>Clearances</Title>
        <Divider style={styles.divider} />
        <Button
          mode="outlined"
          onPress={() => pickImage(setBrgyClearance)}
          style={styles.uploadButton}
          labelStyle={styles.buttonText}
        >
          {brgyClearance ? "Barangay Clearance Added" : "Add Brgy Clearance"}
        </Button>
        {brgyClearance && <Image source={{ uri: brgyClearance }} style={styles.imagePreview} />}
        <Button
          mode="outlined"
          onPress={() => pickImage(setPoliceClearance)}
          style={styles.uploadButton}
          labelStyle={styles.buttonText}
        >
          {policeClearance ? "Police Clearance Added" : "Add Police Clearance"}
        </Button>
        {policeClearance && <Image source={{ uri: policeClearance }} style={styles.imagePreview} />}
        <Button
          mode="outlined"
          onPress={() => pickImage(setTplInsurance)}
          style={styles.uploadButton}
          labelStyle={styles.buttonText}
        >
          {tplInsurance ? "TPL Insurance Added" : "Add TPL Insurance"}
        </Button>
        {tplInsurance && <Image source={{ uri: tplInsurance }} style={styles.imagePreview} />}
        
        {/* Cancel and Confirm Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => console.log("Cancelled")}
            style={[styles.button, styles.cancelButton]}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[styles.button, styles.confirmButton]}
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
    padding: 20,
  },
  card: {
    padding: 20,
    backgroundColor: "#FFC533",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  divider: {
    marginBottom: 15,
    backgroundColor: "black",
  },
  input: {
    marginVertical: 2,
    height: 55, // Adjust this value to change the height of the input field
  },

  uploadButton: {
    marginVertical: 10,
    borderColor: "black",
  },
  buttonText: {
    color: "black",
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
    backgroundColor: "gray",
  },
  confirmButton: {
    backgroundColor: "green",
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
});

export default GetVerified;