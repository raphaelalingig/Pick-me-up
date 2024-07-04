import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Login from "./src/forms/Login";
import { PaperProvider } from "react-native-paper";
import Navigation from "./src/navigation/Navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import "react-native-gesture-handler";



export default function App() {
  return (
    <PaperProvider style={styles.container}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <Navigation />
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
