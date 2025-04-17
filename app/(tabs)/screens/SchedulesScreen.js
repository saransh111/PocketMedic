import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AppwriteManager } from "../appwrite/mediciens_and_doctor_order";

const SchedulesScreen = () => {
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState([]);
  const [medicalOrders, setMedicalOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const manager = new AppwriteManager();

      // Fetch appointments
      const appointmentsData = await manager.getAllAppointments();
      const formattedApps = appointmentsData.map((app) => ({
        ...app,
        type: "appointment",
        id: app.AppointmentID || app.$id,
        date: new Date(app.DateofAppointment).toLocaleDateString(),
        time: app.TimeofAppointmen,
        status: app.Status || "Scheduled",
      }));

      // Fetch medical orders
      const medicalOrdersData = await manager.getAllmedicalOrders();
      const formattedMeds = medicalOrdersData.map((med) => {
        // Create safe ID that can be sliced
        const safeId =
          med.MedicID?.toString() ||
          med.$id ||
          Math.random().toString(36).substr(2, 9);

        return {
          ...med,
          type: "medicine",
          id: safeId,
          orderDate: new Date(med.OrderTime).toLocaleDateString(),
          deliveryDate: new Date(med.DeliveryTime).toLocaleDateString(),
          status: med.Status || "Processing",
          MedicineNames: med.MedicineNames?.filter(Boolean) || [
            "Unknown Medicine",
          ],
        };
      });

      setAppointments(formattedApps);
      setMedicalOrders(formattedMeds);
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Failed to load data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderAppointmentItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name="stethoscope" size={20} color="#4A90E2" />
        <View>
          <Text style={styles.cardTitle}>
            {item.DoctorType || "General Physician"}
          </Text>
          <Text style={styles.doctorName}>
            {item.NameofDoctor || "Doctor not assigned"}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.reasonText}>Reason: {item.Reason}</Text>

        <View style={styles.infoRow}>
          <Icon name="calendar" size={16} color="#666" />
          <Text style={styles.infoText}>{item.date}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="clock" size={16} color="#666" />
          <Text style={styles.infoText}>{item.time}</Text>
        </View>

        {item.Location && (
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={16} color="#666" />
            <Text style={styles.infoText}>{item.Location}</Text>
          </View>
        )}

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              item.status === "Completed"
                ? styles.completedBadge
                : item.status === "Cancelled"
                ? styles.cancelledBadge
                : styles.pendingBadge,
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMedicineItem = ({ item }) => {
    // Ensure we have a string ID that can be sliced
    const displayId = item.id?.toString().slice(-6) || "N/A";

    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="pill" size={20} color="#E91E63" />
          <Text style={styles.cardTitle}>Order #{displayId}</Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.patientText}>
            For: {item.NameOfPatientWhoOrdered}
          </Text>

          <View style={styles.medicinesContainer}>
            <Text style={styles.sectionLabel}>Medicines:</Text>
            {item.MedicineNames.map((medicine, index) => (
              <View key={index} style={styles.medicineRow}>
                <Icon name="pill" size={14} color="#4CAF50" />
                <Text style={styles.medicineText}>{medicine}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoRow}>
            <Icon name="currency-usd" size={16} color="#666" />
            <Text style={styles.infoText}>
              Total: ₹{item.TotalPrice?.toFixed(2) || "Calculating..."}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="calendar" size={16} color="#666" />
            <Text style={styles.infoText}>Ordered: {item.orderDate}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="truck-delivery" size={16} color="#666" />
            <Text style={styles.infoText}>Delivery: {item.deliveryDate}</Text>
          </View>

          <View style={styles.statusContainer}>
            <View style={styles.otpContainer}>
              <Icon name="lock" size={14} color="#E91E63" />
              <Text style={styles.otpText}>OTP: {item.OTPAssigned}</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                item.status === "Delivered"
                  ? styles.completedBadge
                  : item.status === "Cancelled"
                  ? styles.cancelledBadge
                  : styles.processingBadge,
              ]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const sections = [
    {
      title: "Upcoming Appointments",
      data: appointments,
      renderItem: renderAppointmentItem,
      emptyText: "No upcoming appointments scheduled",
    },
    {
      title: "Medicine Orders",
      data: medicalOrders,
      renderItem: renderMedicineItem,
      emptyText: "No active medicine orders",
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading your schedules...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Schedules</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate("Booking")}>
            <Icon name="calendar-plus" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>({section.data.length})</Text>
          </View>
        )}
        renderSectionFooter={({ section }) => {
          if (section.data.length === 0) {
            return (
              <View style={styles.emptySection}>
                <Icon name="information-outline" size={24} color="#999" />
                <Text style={styles.emptyText}>{section.emptyText}</Text>
              </View>
            );
          }
          return null;
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4A90E2"]}
          />
        }
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("Medicine")}
      >
        <Icon name="pill" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    elevation: 3,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
  },
  sectionCount: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  emptySection: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyText: {
    marginTop: 8,
    color: "#999",
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  doctorName: {
    fontSize: 14,
    color: "#666",
  },
  cardContent: {
    gap: 8,
  },
  reasonText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  patientText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  medicinesContainer: {
    marginVertical: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 4,
  },
  medicineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 2,
  },
  medicineText: {
    fontSize: 14,
    color: "#555",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  otpContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  otpText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#E91E63",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: "#FFF3E0",
  },
  processingBadge: {
    backgroundColor: "#E3F2FD",
  },
  completedBadge: {
    backgroundColor: "#E8F5E9",
  },
  cancelledBadge: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  separator: {
    height: 8,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
});

export default SchedulesScreen;
