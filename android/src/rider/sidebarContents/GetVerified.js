import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Image, ToastAndroid, TouchableOpacity } from "react-native";
import { TextInput, Button, Card, Title, Divider } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import userService from "../../services/auth&services";
import * as FileSystem from 'expo-file-system';
import { MaterialCommunityIcons } from "@expo/vector-icons";

const GetVerified = () => {
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpDate, setLicenseExpDate] = useState("");
  const [orExpDate, setOrExpDate] = useState("");
  const [motorPlateNumber, setMotorPlateNumber] = useState("");
  
  const [licenseImage, setLicenseImage] = useState(null);
  const [orCr, setOrCr] = useState(null);
  const [COR, setCOR] = useState(null);
  const [motorModel, setMotorModel] = useState(null);
  const [tplInsurance, setTplInsurance] = useState(null);
  const [brgyClearance, setBrgyClearance] = useState(null);
  const [policeClearance, setPoliceClearance] = useState(null);

  const showToast = (message = "Something went wrong") => {
    ToastAndroid.show(message, 3000);
  };

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return; // Early return if permissions are not granted
      }
  
      // Fetch uploaded images from the database
      try {
        console.log("Fetching uploaded images...");
        const uploadedImages = await userService.getUploadedImages();
        console.log("Uploaded images response:", uploadedImages);
        
        
        // Map the fetched data to the respective states (if available)
        if (uploadedImages && uploadedImages.success) {
          const { data } = uploadedImages; // Extract the data
          setLicenseImage(data.license_image_url);
          setOrCr(data.or_cr_image_url);
          setCOR(data.cor_image_url);
          setMotorModel(data.motor_model_image_url);
          setTplInsurance(data.tpl_insurance_image_url);
          setBrgyClearance(data.brgy_clearance_image_url);
          setPoliceClearance(data.police_clearance_image_url);
        }
      } catch (error) {
        console.error("Error fetching uploaded images:", error);
        showToast("Error fetching uploaded images");
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
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showToast("Error picking image");
    }
  };

  const handleSubmit = async () => {
    try {
      const uploadImage = async (imageUri, requirementId) => {
        if (!imageUri) return;

        const formData = new FormData();
        formData.append('requirement_id', requirementId);
        formData.append('photo', {
          uri: imageUri,
          type: 'image/jpeg',
          name: `requirement_${requirementId}.jpg`,
        });

        const response = await userService.upload(formData);
        console.log(`Upload response for requirement ${requirementId}:`, response);

        if (response && response.success) {
          console.log(`Uploaded requirement ${requirementId} successfully`);
        } else {
          throw new Error(`Failed to upload requirement ${requirementId}`);
        }
      };

      // await Promise.all([
      //   uploadImage(motorModel, 1),
      //   uploadImage(orCr, 2),
      //   uploadImage(COR, 4),
      //   uploadImage(licenseImage, 5),
      //   uploadImage(tplInsurance, 8),
      //   uploadImage(brgyClearance, 9),
      //   uploadImage(policeClearance, 10),
      // ]);

      await uploadImage(motorModel, 1);
      await uploadImage(orCr, 2);
      await uploadImage(COR, 4);
      await uploadImage(licenseImage, 5),
      await uploadImage(tplInsurance, 8),
      await uploadImage(brgyClearance, 9),
      await uploadImage(policeClearance, 10)

      // Handle non-image data
      const textData = new FormData(); // Instantiate as FormData
      textData.append('or_expiration_date', orExpDate);
      textData.append('drivers_license_number', licenseNumber);
      textData.append('license_expiration_date', licenseExpDate);
      textData.append('plate_number', motorPlateNumber);


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

  const renderImageOrIcon = (image, onPress, label) => (
    <TouchableOpacity onPress={onPress} style={styles.imageContainer}>
      <View style={styles.uploadButton}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <MaterialCommunityIcons name="file-document-outline" size={50} color="black" />
        )}
      </View>
      <Title style={styles.imageLabel}>{label}</Title>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Title style={styles.title}>Verify Your Account</Title>
        
        {/* Section: License Details */}
        <Title style={styles.sectionTitle}>License Details</Title>
        <Divider style={styles.divider} />
        {renderImageOrIcon(licenseImage, () => pickImage(setLicenseImage), "License Image")}
        <TextInput
          label="License Number"
          value={licenseNumber}
          onChangeText={setLicenseNumber}
          style={styles.input}
        />
        <TextInput
          label="License Expiration Date"
          value={licenseExpDate}
          onChangeText={setLicenseExpDate}
          style={styles.input}
        />


        {/* Section: Vehicle Information */}
        <Title style={styles.sectionTitle}>Vehicle Information</Title>
        <Divider style={styles.divider} />
        {renderImageOrIcon(motorModel, () => pickImage(setMotorModel), "Motor Model Image")}
        {renderImageOrIcon(orCr, () => pickImage(setOrCr), "OR/CR Image")}
        {renderImageOrIcon(COR, () => pickImage(setCOR), "COR Image")}
        
        <TextInput
          label="OR Expiration Date"
          value={orExpDate}
          onChangeText={setOrExpDate}
          style={styles.input}
        />
        <TextInput
          label="Motor Plate Number"
          value={motorPlateNumber}
          onChangeText={setMotorPlateNumber}
          style={styles.input}
        />

        {/* Section: Clearances */}
        <Title style={styles.sectionTitle}>Clearances</Title>
        <Divider style={styles.divider} />
        {renderImageOrIcon(brgyClearance, () => pickImage(setBrgyClearance), "Barangay Clearance")}
        {renderImageOrIcon(policeClearance, () => pickImage(setPoliceClearance), "Police Clearance")}
        {renderImageOrIcon(tplInsurance, () => pickImage(setTplInsurance), "TPL Insurance")}
        
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
    height: 55,
    backgroundColor: 'white',
  },
  uploadButton: {
    marginVertical: 10,
    borderColor: "black",
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 90,
    height: 90,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  imageLabel: {
    fontSize: 14,
    marginTop: 5,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
  },
  uploadButton: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default GetVerified;