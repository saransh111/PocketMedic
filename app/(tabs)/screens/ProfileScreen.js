import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("johndoe@example.com");
  const [phone, setPhone] = useState("+1234567890");
  const [isEditing, setIsEditing] = useState(false);

  const router = useRouter();

  const handleSave = async () => {
    try {
      const response = await fetch("https://your-api.com/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone }),
      });

      if (response.ok) {
        Alert.alert("Success", "Profile updated successfully!");
        setIsEditing(false);
      } else {
        Alert.alert("Error", "Failed to update profile.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while updating profile.");
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userName");
      router.replace("/login"); // Redirect to login screen
    } catch (error) {
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileField}>
        <Text style={styles.label}>Name:</Text>
        {isEditing ? (
          <TextInput style={styles.input} value={name} onChangeText={setName} />
        ) : (
          <Text style={styles.value}>{name}</Text>
        )}
      </View>

      <View style={styles.profileField}>
        <Text style={styles.label}>Email:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        ) : (
          <Text style={styles.value}>{email}</Text>
        )}
      </View>

      <View style={styles.profileField}>
        <Text style={styles.label}>Phone:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.value}>{phone}</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={isEditing ? handleSave : () => setIsEditing(true)}
      >
        <Text style={styles.buttonText}>
          {isEditing ? "Save" : "Edit Profile"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f7f9" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  profileField: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: "bold" },
  value: { fontSize: 16, color: "#555" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#0057d9",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: "#d9534f",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
