import { Client, Databases, ID, Query } from "appwrite";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class AppwriteManager {
  constructor() {
    this.client = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("67f2cefd00090a2866dc");

    this.databases = new Databases(this.client);

    this.databaseId = "67f2cf8900281c55bcba";
    this.appointmentCollection = "67f2cffe003e34296e51";
    this.medicineCollection = "67f2d03a00019b21777b";
    this.chatCollection = "your_chat_collection_id"; // Replace with actual chat collection ID
  }

  generateOTP(length = 5) {
    return Math.floor(100000 + Math.random() * 900000)
      .toString()
      .substring(0, length);
  }

  findMatchedKeyword(sentence, wordList) {
    const lowerSentence = sentence.toLowerCase();
    return (
      wordList.find((word) => lowerSentence.includes(word.toLowerCase())) ||
      "General Physician"
    );
  }

  async ghar(reason) {
    const url = "https://chatgpt-42.p.rapidapi.com/aitohuman";
    const options = {
      method: "POST",
      headers: {
        "x-rapidapi-key": "ef824a541emshe5019c2d145a231p159007jsne76ae13a6062",
        "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: `answer strictly strictly strictly in one word one word one word only select from the doctor list required from this list {General Physician, Internal Medicine, Family Medicine, Neurologist, Neurosurgeon, Psychiatrist, Cardiologist, Cardiothoracic Surgeon, Orthopedic Surgeon, Rheumatologist, Pulmonologist, Endocrinologist, Ophthalmologist, Optometrist, ENT Specialist, Pediatrician, Gynecologist, Obstetrician, OB-GYN, Dermatologist, Gastroenterologist, Dentist, Oral Surgeon, Nephrologist, Urologist, Fertility Specialist, Andrologist, Immunologist, Infectious Disease Specialist, Oncologist, Plastic Surgeon, Pathologist, Radiologist, Anesthesiologist, Geriatrician.} based on the symptoms ${reason}`,
      }),
    };

    const keywords = [
      "General Physician",
      "Internal Medicine",
      "Family Medicine",
      "Neurologist",
      "Neurosurgeon",
      "Psychiatrist",
      "Cardiologist",
      "Cardiothoracic",
      "Orthopedic",
      "Rheumatologist",
      "Pulmonologist",
      "Endocrinologist",
      "Ophthalmologist",
      "Optometrist",
      "ENT Specialist",
      "Pediatrician",
      "Gynecologist",
      "Obstetrician",
      "OB-GYN",
      "Dermatologist",
      "Gastroenterologist",
      "Dentist",
      "Oral Surgeon",
      "Nephrologist",
      "Urologist",
      "Fertility Specialist",
      "Andrologist",
      "Immunologist",
      "Infectious Disease Specialist",
      "Oncologist",
      "Plastic Surgeon",
      "Pathologist",
      "Radiologist",
      "Anesthesiologist",
      "Geriatrician",
    ];

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      console.log(result);
      const outputText = result.result[0] || "";
      console.log("API Output:", outputText);
      const matchedDoctor = this.findMatchedKeyword(outputText, keywords);
      console.log("Matched Doctor:", matchedDoctor);
      return matchedDoctor;
    } catch (error) {
      console.error("Error in ghar():", error);
      return "General Physician";
    }
  }

  async addAppointment({ NameofPatient, TimeofAppointment, Reason }) {
    const DateofAppointment = new Date().toISOString();
    const storedName = await AsyncStorage.getItem("userName");
    const DoctorType = await this.ghar(Reason);
    const AppointmentID = ID.unique();
    const TimeofAppointmen = new Date().toLocaleTimeString();
    const payload = {
      NameofPatient: storedName || NameofPatient,
      TimeofAppointmen,
      Reason,
      DateofAppointment,
      DoctorAssigned: "",
      NameofDoctor: "",
      DoctorType,
      AppointmentID,
    };

    return this.databases.createDocument(
      this.databaseId,
      this.appointmentCollection,
      ID.unique(),
      payload
    );
  }

  async orderMedicines({ userId, medicineNames }) {
    console.log("sdnvlsdnv");
    console.log(medicineNames);
    console.log(userId);
    const now = new Date();
    const deliveryDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    console.log(deliveryDate);
    const OrderTime = now.toISOString();
    const DeliveryTime = deliveryDate.toISOString();
    console.log(medicineNames);
    console.log(userId);
    const OTPAssigned = this.generateOTP();

    const MedicID = Date.now() + Math.floor(Math.random() * 1000); // Match how it's generated in addMedicineOrder()
    console.log(medicineNames);
    console.log(userId);
    const payload = {
      NameOfPatientWhoOrdered: userId,
      MedicineNames: medicineNames,
      OrderTime,
      DeliveryTime,
      Status: "Pending",
      OTPAssigned,
      MedicID,
    };

    return this.databases.createDocument(
      this.databaseId,
      this.medicineCollection,
      ID.unique(),
      payload
    );
  }

  async addChatMessage({ sender, receiver, message }) {
    const Timestamp = new Date().toISOString();

    const payload = {
      sender,
      receiver,
      message,
      Timestamp,
    };

    return this.databases.createDocument(
      this.databaseId,
      this.chatCollection,
      ID.unique(),
      payload
    );
  }

  // In your AppwriteManager class
  async getAllAppointments() {
    const storedName = await AsyncStorage.getItem("userName");
    try {
      const response = await this.databases.listDocuments(
        this.databaseId,
        this.appointmentCollection,
        [
          Query.equal("NameofPatient", storedName),
          Query.orderDesc("DateofAppointment"),
        ]
      );
      return response.documents; // Return just the documents array
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  }

  async getAllmedicalOrders() {
    const storedName = await AsyncStorage.getItem("userName");
    try {
      const response = await this.databases.listDocuments(
        this.databaseId,
        this.medicineCollection,
        [
          Query.equal("NameOfPatientWhoOrdered", storedName),
          Query.orderDesc("OrderTime"),
        ]
      );
      return response.documents; // Return just the documents array
    } catch (error) {
      console.error("Error fetching medical orders:", error);
      throw error;
    }
  }
}
