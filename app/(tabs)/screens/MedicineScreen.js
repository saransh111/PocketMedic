import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppwriteManager } from "../appwrite/mediciens_and_doctor_order";

const MedicineScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState([]);

  const availableMedicines = [
    { id: "1", name: "Paracetamol", price: 50 },
    { id: "2", name: "Ibuprofen", price: 80 },
    { id: "3", name: "Cough Syrup", price: 120 },
    { id: "4", name: "Antibiotic", price: 150 },
  ];

  const addMedicine = (medicine) => {
    const existing = selectedMedicines.find((m) => m.id === medicine.id);
    if (existing) {
      setSelectedMedicines(
        selectedMedicines.map((m) =>
          m.id === medicine.id ? { ...m, quantity: m.quantity + 1 } : m
        )
      );
    } else {
      setSelectedMedicines([
        ...selectedMedicines,
        { ...medicine, quantity: 1 },
      ]);
    }
  };

  const removeMedicine = (id) => {
    setSelectedMedicines(
      selectedMedicines
        .map((m) => (m.id === id ? { ...m, quantity: m.quantity - 1 } : m))
        .filter((m) => m.quantity > 0)
    );
  };

  async function sendMedicines() {
    const medicineNames = selectedMedicines.map((med) => med.name);
    const userId = await AsyncStorage.getItem("userName");
    const manager = new AppwriteManager();
    console.log(AppwriteManager, manager.orderMedicines);
    try {
      console.log(medicineNames);
      const response = await manager.orderMedicines({
        userId,
        medicineNames,
      });
      console.log(response);
      Alert.alert("Success", "Medicines ordered successfully!");
      setSelectedMedicines([]);
    } catch (error) {
      Alert.alert("Error", "Network error occurred.");
    }
  }

  const totalPrice = selectedMedicines.reduce(
    (sum, med) => sum + med.price * med.quantity,
    0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Medicines</Text>

      {selectedMedicines.length === 0 ? (
        <Text style={styles.emptyText}>No medicines selected yet.</Text>
      ) : (
        <FlatList
          data={selectedMedicines}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.medicineItem}>
              <Text>
                {item.name} - ₹{item.price} x {item.quantity}
              </Text>
              <View style={styles.counter}>
                <Pressable
                  onPress={() => removeMedicine(item.id)}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>-</Text>
                </Pressable>
                <Pressable
                  onPress={() => addMedicine(item)}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>+</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      {selectedMedicines.length > 0 && (
        <>
          <Text style={styles.totalPrice}>Total: ₹{totalPrice}</Text>
          <Pressable style={styles.sendButton} onPress={sendMedicines}>
            <Text style={styles.sendText}>Send Order</Text>
          </Pressable>
        </>
      )}

      <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.plusText}>+</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Medicine</Text>

            <FlatList
              data={availableMedicines}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.medicineItem}
                  onPress={() => addMedicine(item)}
                >
                  <Text>
                    {item.name} - ₹{item.price}
                  </Text>
                </Pressable>
              )}
            />

            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f7f9" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  emptyText: { textAlign: "center", marginTop: 20, fontStyle: "italic" },
  medicineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#fff",
    marginVertical: 5,
    borderRadius: 5,
    elevation: 2,
  },
  counter: { flexDirection: "row", gap: 10 },
  button: { backgroundColor: "#0057d9", padding: 5, borderRadius: 5 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0057d9",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  plusText: { color: "white", fontSize: 24, fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "red",
    borderRadius: 5,
    alignItems: "center",
  },
  closeText: { color: "white", fontWeight: "bold" },
  sendButton: {
    marginTop: 20,
    backgroundColor: "green",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  sendText: { color: "white", fontWeight: "bold", fontSize: 16 },
  totalPrice: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default MedicineScreen;
