import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Appbar } from 'react-native-paper';

  
const GetVerified = () => {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseImage, setLicenseImage] = useState(null);
  const [orCr, setOrCr] = useState(null);
  const [tplInsurance, setTplInsurance] = useState(null);
  const [brgyClearance, setBrgyClearance] = useState(null);
  const [policeClearance, setPoliceClearance] = useState(null);
  const [nbiClearance, setNbiClearance] = useState(null);
  const [motorWithPlateNumber, setMotorWithPlateNumber] = useState('');

    const handleConfirm = () => {
      // Handle form submission
    };
  return (
    <ScrollView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Verified Your Account" />
      </Appbar.Header>

      <View style={styles.form}>
        <TextInput
          label="License Number"
          value={licenseNumber}
          onChangeText={setLicenseNumber}
          style={styles.input}
        />
        <Button mode="contained" onPress={() => {}} style={styles.button}>
          Add Photo
        </Button>

        <Button mode="contained" onPress={() => {}} style={styles.button}>
          Add Photo
        </Button>

        <Button mode="contained" onPress={() => {}} style={styles.button}>
          Add Photo
        </Button>

        <Button mode="contained" onPress={() => {}} style={styles.button}>
          Add Photo
        </Button>

        <Button mode="contained" onPress={() => {}} style={styles.button}>
          Add Photo
        </Button>

        <Button mode="contained" onPress={() => {}} style={styles.button}>
          Add Photo
        </Button>

        <TextInput
          label="Motor with Plate Number"
          value={motorWithPlateNumber}
          onChangeText={setMotorWithPlateNumber}
          style={styles.input}
        />

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => {}}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleConfirm}
            style={styles.confirmButton}
          >
            Confirm
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "red",
  },
  confirmButton: {
    backgroundColor: "green",
  },
});

export default GetVerified

