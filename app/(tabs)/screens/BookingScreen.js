import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AppwriteManager } from "../appwrite/mediciens_and_doctor_order";

const BookingScreen = () => {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize AppwriteManager
  const appwriteManager = new AppwriteManager();

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || date;
    setShowTimePicker(Platform.OS === "ios");
    setDate(currentTime);
  };

  const formatDate = (date) => date.toLocaleDateString();
  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleBooking = async () => {
    if (!name || !reason) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await appwriteManager.addAppointment({
        NameofPatient: name,
        TimeofAppointment: date.toISOString(),
        Reason: reason,
      });

      // Appwrite's createDocument returns the created document directly
      Alert.alert(
        "Success",
        `Appointment booked successfully!\n\nAppointment ID: ${response.AppointmentID}`
      );

      // Reset form
      setName("");
      setReason("");
      setDate(new Date());
    } catch (err) {
      console.error("Appointment error:", err);
      Alert.alert("Error", "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book a Doctor Appointment</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <View style={styles.dateTimeContainer}>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={[styles.input, styles.dateTimeInput]}
        >
          <Text>{`Date: ${formatDate(date)}`}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowTimePicker(true)}
          style={[styles.input, styles.dateTimeInput]}
        >
          <Text>{`Time: ${formatTime(date)}`}</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <TextInput
        style={[styles.input, styles.reasonInput]}
        placeholder="Reason for Appointment"
        value={reason}
        onChangeText={setReason}
        multiline
        numberOfLines={3}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <Button
          title="Book Appointment"
          onPress={handleBooking}
          disabled={loading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9fbff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  reasonInput: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateTimeInput: {
    width: "48%",
  },
});

export default BookingScreen;
