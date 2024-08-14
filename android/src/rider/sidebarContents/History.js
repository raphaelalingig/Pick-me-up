import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { DataTable, TextInput } from "react-native-paper";
import AntDesign from "@expo/vector-icons/AntDesign";
import { TouchableOpacity } from "react-native-gesture-handler";
import EvilIcons from "@expo/vector-icons/EvilIcons";

const History = () => {
  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TextInput
          label="Search"
          mode="outlined"
          style={{ width: "90%" }}
          selectionColor="red"
          left={
            <TextInput.Icon
              icon={() => <EvilIcons name="search" size={24} color="black" />}
            />
          }
          theme={{
            colors: {
              primary: "black",
              outline: "black",
            },
          }}
        />
        <TouchableOpacity
          style={{ padding: 5, backgroundColor: "#F4F4F4", marginLeft: 5 }}
        >
          <AntDesign name="filter" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title style={{ width: "20%" }}>Date</DataTable.Title>
            <DataTable.Title style={{ width: "20%" }}>Drop Place</DataTable.Title>
            <DataTable.Title style={{ width: "20%" }}>Date</DataTable.Title>
          </DataTable.Header>
          <DataTable.Row>
            <DataTable.Cell>1</DataTable.Cell>
            <DataTable.Cell>2</DataTable.Cell>
            <DataTable.Cell>3</DataTable.Cell>
          </DataTable.Row>
        </DataTable>
      </View>
    </View>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    height: "100%",
  },
});
