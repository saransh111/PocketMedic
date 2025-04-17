// app/index.jsx
import { useRouter } from "expo-router";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const userName = await AsyncStorage.getItem("userName");
      await AsyncStorage.removeItem("chatMessages");
      if (userName) router.replace("/home");
      else router.replace("/login");
    };
    checkLogin();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0057d9" />
    </View>
  );
}
