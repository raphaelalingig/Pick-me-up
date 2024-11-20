import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import userService from "../services/auth&services";
import { useAuth } from "../services/useAuth";

const CustomDrawerContent = (props) => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Shared value for button scale and opacity
  const buttonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);

  const handleLogout = async () => {
    // Prevent multiple clicks
    if (isLoading) return;

    setIsLoading(true);

    // Animate button
    buttonScale.value = withSpring(0.9);
    buttonOpacity.value = withTiming(0.5, { duration: 200 });

    try {
      await userService.logout();
      logout();
    } catch (error) {
      console.error("Logout failed", error);
      // Reset state on error
      setIsLoading(false);
      buttonScale.value = withSpring(1);
      buttonOpacity.value = withTiming(1);
    }
  };

  // Animated button style
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
      opacity: buttonOpacity.value,
    };
  });

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <View style={styles.logoutContainer}>
        <Animated.View style={animatedButtonStyle}>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
            disabled={isLoading}
          >
            <Text style={styles.logoutText}>
              {isLoading ? "Logging out..." : "Logout"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  logoutContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  logoutButton: {
    backgroundColor: "#f00",
    padding: 10,
    borderRadius: 5,
  },
  logoutText: {
    color: "#fff",
    textAlign: "center",
  },
});

export default CustomDrawerContent;
