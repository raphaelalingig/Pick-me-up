import { StyleSheet, Text, View, FlatList, Alert, RefreshControl, Modal, Button } from "react-native";
import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { DataTable, TextInput } from "react-native-paper";
import AntDesign from "@expo/vector-icons/AntDesign";
import { TouchableOpacity } from "react-native-gesture-handler";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import userService from "../../services/auth&services";

const History = ({ navigation }) => {
  const [rideHistory, setRideHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null); // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);

  const getHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.getHistory();
      if (response && response.data) {
        setRideHistory(response.data);
      } else {
        console.error("No ride history data found.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to retrieve ride history.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getHistory();
    setRefreshing(false);
  }, [getHistory]);

  useFocusEffect(
    useCallback(() => {
      getHistory();
    }, [getHistory])
  );

  const filteredHistory = rideHistory.filter((item) =>
    item.dropoff_location.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (item) => {
    setSelectedHistory(item);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedHistory(null);
  };

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
          value={search}
          onChangeText={setSearch}
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

      <DataTable>
        <DataTable.Header>
          <DataTable.Title style={{ width: "30%" }}>Pickup</DataTable.Title>
          <DataTable.Title style={{ width: "30%" }}>Drop Place</DataTable.Title>
          <DataTable.Title style={{ width: "20%" }}>Date</DataTable.Title>
        </DataTable.Header>

        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.ride_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openModal(item)}>
              <DataTable.Row>
                <DataTable.Cell>{item.pickup_location}</DataTable.Cell>
                <DataTable.Cell>{item.dropoff_location}</DataTable.Cell>
                <DataTable.Cell>{new Date(item.ride_date).toLocaleDateString()}</DataTable.Cell>
              </DataTable.Row>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </DataTable>

      {/* Modal for showing detailed information */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ride Details</Text>
            {selectedHistory && (
              <>
                <Text>Rider: {selectedHistory.rider ? `${selectedHistory.rider.first_name} ${selectedHistory.rider.last_name}` : 'No Rider     '}</Text>
                <Text>Pickup: {selectedHistory.pickup_location}</Text>
                <Text>Dropoff: {selectedHistory.dropoff_location}</Text>
                <Text>Ride Date: {new Date(selectedHistory.ride_date).toLocaleDateString()}</Text>
                <Text>Fare: {selectedHistory.fare}</Text>
                <Text>Status: {selectedHistory.status}</Text>
                {/* Add more details as needed */}
              </>
            )}
            <Button title="Close" onPress={closeModal} />
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
