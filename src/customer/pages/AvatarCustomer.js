import { StyleSheet, View } from "react-native";
import React, { useState } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Menu, Divider, IconButton, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const AvatarCustomer = ({}) => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      contentStyle={{ backgroundColor: "white" }}
      anchor={
        <IconButton
          icon={() => <FontAwesome5 name="user-alt" size={24} color="black" />}
          onPress={openMenu}
          style={{ marginRight: 15 }}
        />
      }
      anchorPosition="bottom"
    >
      <Menu.Item
        onPress={() => {
          navigation.navigate("RiderStack");
        }}
        title="Change UserType"
        titleStyle={styles.avatarDropdown}
      />
    </Menu>
  );
};

export default AvatarCustomer;

const styles = StyleSheet.create({
  avatarDropdown: {
    color: "black",
    fontSize: 14,
  },
});
