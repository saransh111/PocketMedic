import React, { useState } from "react";
import { View, Text, TextInput, Button, AsyncStorage } from "react-native";

export default function Register({ setUser }) {
  const [name, setName] = useState("");

  const handleRegister = async () => {
    if (name.trim()) {
      await AsyncStorage.setItem("userName", name);
      setUser(name);
    }
  };

  return (
    <View>
      <Text>Register</Text>
      <TextInput
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}
