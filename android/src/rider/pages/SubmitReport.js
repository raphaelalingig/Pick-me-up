import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { TextInput, Text } from "react-native-paper";

const SubmitReport = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.inputContainer}>
          <View>
            <TextInput
              placeholder="Customer Name:"
              editable={false}
              style={styles.textinput}
              mode="outlined"
            />
          </View>
          <View>
            <TextInput
              placeholder="Write Down your Complaint"
              style={styles.messageInput}
              mode="outlined"
              label="Message:"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              value="Date: "
              editable={false}
              style={styles.textinput}
              mode="outlined"
            />
            <TextInput
              value="Location: "
              editable={false}
              style={styles.textinput}
              mode="outlined"
            />
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.acceptButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SubmitReport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    padding: 20,
    backgroundColor: "#FFC533",
    width: "90%",
  },
  textinput: {
    backgroundColor: "white",
    width: "100%",
  },
  inputContainer: {
    gap: 10,
  },
  messageInput: {
    backgroundColor: "white",
    height: 70,
  },
  buttonContainer: {
    justifyContent: "flex-end",
    flexDirection: "row",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#FFF",
  },
  acceptButton: {
    backgroundColor: "#158D01",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  acceptButtonText: {
    color: "#FFF",
  },
});
