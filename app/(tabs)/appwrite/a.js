// import { Client, Databases, ID, Query } from "node-appwrite";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// // Initialize Appwrite client
// const appwrite = new Client()
//   .setEndpoint("https://cloud.appwrite.io/v1")
//   .setProject("67f2cefd00090a2866dc");

// const databases = new Databases(appwrite);

// // Initialize Gemini AI
// let model;
// try {
//   const genAI = new GoogleGenerativeAI(
//     "AIzaSyDP7Yv7nQYner8oK6lQY_dXReB6m_fa1Bw"
//   );
//   model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// } catch (error) {
//   console.error("Failed to initialize Gemini AI:", error.message);
//   throw error;
// }

// // Database constants matching your schema
// const DB_ID = "67f2cf8900281c55bcba";
// const COLLECTIONS = {
//   CHATS: "67f98ccc003570ed05d9",
//   APPOINTMENTS: "67f2cffe003e34296e51",
//   MEDICINES: "67f2d03a00019b21777b",
//   USERS: "your_users_collection_id",
// };

// export const handler = async (event) => {
//   try {
//     if (!model) throw new Error("AI service unavailable");

//     const { userId, message, location } = JSON.parse(event.body);
//     if (!userId || !message) {
//       throw new Error("Missing required fields");
//     }

//     // 1. Get user details and conversation
//     const [user, conversation] = await Promise.all([
//       getUserDetails(userId),
//       getConversation(userId),
//     ]);

//     // Initialize Messages array if needed
//     if (!conversation.Messages || !Array.isArray(conversation.Messages)) {
//       conversation.Messages = [];
//     }

//     // Add user message
//     conversation.Messages.push(`user: ${String(message).substring(0, 900)}`);

//     // 2. Generate appropriate response
//     let aiResponse;
//     if (
//       isMedicineRequest(message) &&
//       !hasConfirmedMedicine(conversation.Messages)
//     ) {
//       aiResponse = await suggestMedicines(message);
//     } else {
//       aiResponse = await generateAIResponse(
//         conversation.Messages,
//         location,
//         user.name
//       );
//     }

//     // Add AI response
//     conversation.Messages.push(
//       `assistant: ${String(aiResponse.response).substring(0, 900)}`
//     );

//     // 3. Handle actions if valid and confirmed
//     if (aiResponse.action && isValidAction(aiResponse.action)) {
//       if (
//         aiResponse.action.type === "medicine" &&
//         !hasConfirmedMedicine(conversation.Messages)
//       ) {
//         // Don't process medicine order until confirmed
//         aiResponse.action = null;
//       } else {
//         await handleAction(aiResponse.action, userId, user.name, location);
//       }
//     }

//     // 4. Update conversation
//     await saveConversation(conversation);

//     return {
//       statusCode: 200,
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         response: aiResponse.response,
//         action: aiResponse.action?.type || null,
//       }),
//     };
//   } catch (error) {
//     console.error("Handler Error:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         error: "Internal server error",
//         details: error.message,
//       }),
//     };
//   }
// };

// // Get user details including patient name
// async function getUserDetails(userId) {
//   try {
//     const user = await databases.getDocument(DB_ID, COLLECTIONS.USERS, userId);
//     return {
//       name: user.name || `Patient-${userId.substring(0, 5)}`,
//       // Add other user fields as needed
//     };
//   } catch (error) {
//     console.error("Error fetching user details:", error);
//     return {
//       name: `Patient-${userId.substring(0, 5)}`,
//     };
//   }
// }

// // Appointment booking using your exact schema
// async function bookAppointment(userId, patientName, reason, location) {
//   const now = new Date();
//   const doctorType = await determineDoctorType(reason);

//   const payload = {
//     NameofPatient: patientName,
//     TimeofAppointmen: now.toLocaleTimeString(),
//     Reason: reason,
//     DateofAppointment: now.toISOString(),
//     DoctorAssigned: "",
//     NameofDoctor: "",
//     DoctorType: doctorType,
//     AppointmentID: ID.unique(),
//     Location: location || "unknown",
//     Status: "Scheduled",
//   };

//   try {
//     const appointment = await databases.createDocument(
//       DB_ID,
//       COLLECTIONS.APPOINTMENTS,
//       ID.unique(),
//       payload
//     );

//     return {
//       success: true,
//       appointmentId: appointment.$id,
//       ...payload,
//     };
//   } catch (error) {
//     console.error("Error creating appointment:", error);
//     throw error;
//   }
// }

// // Medicine order using your exact schema
// async function orderMedicines(userId, patientName, medicineNames, location) {
//   const now = new Date();
//   const deliveryDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

//   const payload = {
//     NameOfPatientWhoOrdered: patientName,
//     TotalPrice: "0.00", // You would calculate this in production
//     MedicineNames: Array.isArray(medicineNames)
//       ? medicineNames
//       : [medicineNames],
//     OrderTime: now.toISOString(),
//     DeliveryTime: deliveryDate.toISOString(),
//     Status: "Pending",
//     OTPAssigned: generateOTP(),
//     MedicID: ID.unique(),
//     Location: location || "unknown",
//   };

//   try {
//     const order = await databases.createDocument(
//       DB_ID,
//       COLLECTIONS.MEDICINES,
//       ID.unique(),
//       payload
//     );

//     return {
//       success: true,
//       orderId: order.$id,
//       ...payload,
//     };
//   } catch (error) {
//     console.error("Error creating medicine order:", error);
//     throw error;
//   }
// }

// // Determine doctor type based on symptoms (similar to your ghar() method)
// async function determineDoctorType(symptoms) {
//   const keywords = [
//     "General Physician",
//     "Cardiologist",
//     "Orthopedic",
//     "Neurologist",
//     "Dermatologist",
//     "Gastroenterologist",
//     "Pediatrician",
//   ];

//   try {
//     const chat = model.startChat();
//     const prompt = `Based on these symptoms: "${symptoms}", select the most appropriate doctor type from this list: ${keywords.join(
//       ", "
//     )}. Respond with only the doctor type.`;

//     const result = await chat.sendMessage(prompt);
//     const doctorType = result.response.text().trim();

//     return keywords.find((k) => doctorType.includes(k)) || "General Physician";
//   } catch (error) {
//     console.error("Error determining doctor type:", error);
//     return "General Physician";
//   }
// }

// // Action handler using your exact schema
// async function handleAction(action, userId, patientName, location) {
//   try {
//     switch (action.type) {
//       case "appointment":
//         const appointment = await bookAppointment(
//           userId,
//           patientName,
//           action.details?.reason || "Medical consultation",
//           location
//         );
//         console.log("Appointment created:", appointment);
//         break;

//       case "medicine":
//         const medicines =
//           action.details.medicines || getSuggestedMedicinesFromHistory();
//         const order = await orderMedicines(
//           userId,
//           patientName,
//           medicines,
//           location
//         );
//         console.log("Medicine order created:", order);
//         break;
//     }
//   } catch (error) {
//     console.error("Error handling action:", error);
//     throw error;
//   }
// }

// // Helper functions (same as previous implementation)
// function isMedicineRequest(message) {
//   const lowerMsg = message.toLowerCase();
//   return /medicine|prescription|refill|pharmacy|drug/i.test(lowerMsg);
// }

// function hasConfirmedMedicine(messages) {
//   return messages.some(
//     (msg) =>
//       msg.startsWith("user:") &&
//       /yes|confirm|proceed|ok|go ahead/i.test(msg.toLowerCase())
//   );
// }

// async function suggestMedicines(message) {
//   try {
//     const chat = model.startChat();
//     const prompt = `Based on these symptoms: "${message}", suggest 2-3 appropriate medicines.
//     Respond in JSON format:
//     {
//       "response": "For these symptoms, I suggest: [medicine1], [medicine2]. Would you like to order?",
//       "suggestions": ["medicine1", "medicine2"],
//       "action": null
//     }`;

//     const result = await chat.sendMessage(prompt);
//     const responseText = result.response
//       .text()
//       .replace(/```json/g, "")
//       .replace(/```/g, "")
//       .trim();

//     return JSON.parse(responseText);
//   } catch (error) {
//     console.error("Error suggesting medicines:", error);
//     return {
//       response:
//         "I can suggest medicines if you describe your symptoms. Would you like that?",
//       action: null,
//     };
//   }
// }

// async function generateAIResponse(messages, location, patientName) {
//   try {
//     const lastUserMessage =
//       messages[messages.length - 1]?.split(":")[1]?.trim() || "";
//     const chat = model.startChat({
//       history: messages.slice(0, -1).map((msg) => {
//         const role = msg.startsWith("user") ? "user" : "model";
//         const content = msg.split(":")[1]?.trim() || "";
//         return { role, parts: [{ text: content }] };
//       }),
//     });

//     let prompt;

//     if (hasConfirmedMedicine(messages)) {
//       const suggestedMeds = getSuggestedMedicinesFromHistory(messages);
//       prompt = `The patient ${patientName} confirmed ordering: ${suggestedMeds.join(
//         ", "
//       )}.
//       Create a medicine order response with OTP. Use this JSON format:
//       {
//         "response": "Your order for ${suggestedMeds.join(
//           ", "
//         )} has been placed. OTP: [6-digit-OTP]",
//         "action": {
//           "type": "medicine",
//           "details": {
//             "medicines": ${JSON.stringify(suggestedMeds)}
//           }
//         }
//       }`;
//     } else if (isAppointmentRequest(lastUserMessage)) {
//       const reason = lastUserMessage;
//       prompt = `Patient ${patientName} requests appointment for: "${reason}".
//       Determine specialty and respond in JSON:
//       {
//         "response": "Your appointment with [specialty] has been scheduled.",
//         "action": {
//           "type": "appointment",
//           "details": {
//             "specialty": "[determined-specialty]",
//             "reason": "${reason}"
//           }
//         }
//       }`;
//     } else {
//       prompt = `As a medical assistant, respond to this in JSON:
//       {
//         "response": "[your-response]",
//         "action": null
//       }
//       Patient: ${patientName}, Location: ${
//         location || "unknown"
//       }, Request: "${lastUserMessage}"`;
//     }

//     const result = await chat.sendMessage(prompt);
//     const responseText = result.response
//       .text()
//       .replace(/```json/g, "")
//       .replace(/```/g, "")
//       .trim();

//     return JSON.parse(responseText);
//   } catch (error) {
//     console.error("AI Generation Error:", error);
//     return {
//       response: "I'm having trouble responding. Please try again.",
//       action: null,
//     };
//   }
// }

// function isAppointmentRequest(message) {
//   const lowerMsg = message.toLowerCase();
//   return /appointment|see (a )?doctor|consult|visit|checkup/i.test(lowerMsg);
// }

// function getSuggestedMedicinesFromHistory(messages) {
//   for (let i = messages.length - 1; i >= 0; i--) {
//     if (messages[i].startsWith("assistant:")) {
//       try {
//         const content = messages[i].split(":")[1]?.trim();
//         const jsonStart = content.indexOf("{");
//         const jsonEnd = content.lastIndexOf("}");
//         if (jsonStart !== -1 && jsonEnd !== -1) {
//           const jsonStr = content.substring(jsonStart, jsonEnd + 1);
//           const response = JSON.parse(jsonStr);
//           if (response.suggestions) {
//             return response.suggestions;
//           }
//         }
//       } catch (e) {
//         continue;
//       }
//     }
//   }
//   return ["General Medicine"];
// }

// function isValidAction(action) {
//   if (!action?.type) return false;

//   if (action.type === "appointment") {
//     return !!action.details?.specialty;
//   }

//   if (action.type === "medicine") {
//     return (
//       Array.isArray(action.details?.medicines) &&
//       action.details.medicines.length > 0
//     );
//   }

//   return false;
// }

// async function getConversation(userId) {
//   try {
//     const result = await databases.listDocuments(DB_ID, COLLECTIONS.CHATS, [
//       Query.equal("userId", userId),
//       Query.limit(1),
//     ]);

//     return (
//       result.documents[0] || {
//         userId: userId,
//         Messages: [],
//       }
//     );
//   } catch (error) {
//     console.error("Error getting conversation:", error);
//     return {
//       userId: userId,
//       Messages: [],
//     };
//   }
// }

// async function saveConversation(conversation) {
//   try {
//     const data = {
//       Messages: conversation.Messages.map((msg) =>
//         String(msg).substring(0, 900)
//       ),
//       userId: conversation.userId,
//     };

//     if (conversation.$id) {
//       await databases.updateDocument(
//         DB_ID,
//         COLLECTIONS.CHATS,
//         conversation.$id,
//         data
//       );
//     } else {
//       await databases.createDocument(DB_ID, COLLECTIONS.CHATS, ID.unique(), {
//         ...data,
//       });
//     }
//   } catch (error) {
//     console.error("Error saving conversation:", error);
//     throw error;
//   }
// }

// function generateOTP() {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }
