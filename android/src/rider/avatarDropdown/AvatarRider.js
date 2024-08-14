import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Menu, Divider, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const AvatarRider = () => {
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
          /* Handle UserType action */
        }}
        title="Change UserType"
        titleStyle={styles.avatarDropdown}
      />
      <Divider />
      <Menu.Item
        onPress={() => navigation.navigate("Login")}
        title="Logout"
        titleStyle={styles.avatarDropdown}
      />
    </Menu>
  );
};

export default AvatarRider;

const styles = StyleSheet.create({
  avatarDropdown: {
    color: "black",
    fontSize: 14,
  },
});
