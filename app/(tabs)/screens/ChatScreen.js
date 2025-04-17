import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

const ChatScreen = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState("mera_pra"); // You can make this dynamic if needed
  const [location] = useState("Seattle"); // You can make this dynamic if needed

  useEffect(() => {
    loadMessages();
  }, []);

  // Load messages from local storage
  const loadMessages = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem("chatMessages");
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    } catch (error) {
      console.error("Failed to load messages", error);
    }
  };

  // Save messages to local storage
  const saveMessages = async (newMessages) => {
    try {
      await AsyncStorage.setItem("chatMessages", JSON.stringify(newMessages));
    } catch (error) {
      console.error("Failed to save messages", error);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (inputText.trim()) {
      const userMessage = {
        id: Date.now(),
        text: inputText,
        sender: "user",
        timestamp: new Date().toISOString(),
      };

      // Update local messages with user message
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInputText("");
      await saveMessages(updatedMessages);

      // Get bot response
      getBotResponse(inputText);
    }
  };

  // Get response from your API
  const getBotResponse = async (userInput) => {
    setIsLoading(true);

    try {
      // First add a loading message
      const loadingMessage = {
        id: Date.now() + 1,
        text: "Typing...",
        sender: "bot",
        isLoading: true,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, loadingMessage]);
      let name = await AsyncStorage.getItem("userName");
      // Call your API
      const response = await fetch(
        "https://lswjzyyft3.execute-api.eu-north-1.amazonaws.com/my_sam_ai1/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: name,
            message: userInput,
            location: location,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      // Extract the response text from your API's format
      const botResponse =
        data.response || "I couldn't understand that. Please try again.";

      // Remove loading message and add actual response
      setMessages((prev) => {
        const newMessages = prev.filter((msg) => !msg.isLoading);
        return [
          ...newMessages,
          {
            id: Date.now() + 2,
            text: botResponse,
            sender: "bot",
            timestamp: new Date().toISOString(),
          },
        ];
      });

      // Save to local storage
      await saveMessages([
        ...messages,
        {
          id: Date.now(),
          text: userInput,
          sender: "user",
          timestamp: new Date().toISOString(),
        },
        {
          id: Date.now() + 2,
          text: botResponse,
          sender: "bot",
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to get bot response", error);

      // Remove loading message and show error
      setMessages((prev) => {
        const newMessages = prev.filter((msg) => !msg.isLoading);
        return [
          ...newMessages,
          {
            id: Date.now() + 2,
            text: "Sorry, I couldn't process your request. Please try again.",
            sender: "bot",
            timestamp: new Date().toISOString(),
          },
        ];
      });

      // Save to local storage
      await saveMessages([
        ...messages,
        {
          id: Date.now(),
          text: userInput,
          sender: "user",
          timestamp: new Date().toISOString(),
        },
        {
          id: Date.now() + 2,
          text: "Sorry, I couldn't process your request.",
          sender: "bot",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete chat messages from local storage
  const deleteChat = async () => {
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete all messages?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("chatMessages");
              setMessages([]);
            } catch (error) {
              console.error("Failed to delete messages", error);
            }
          },
        },
      ]
    );
  };

  // Render each message
  const renderMessage = ({ item }) => {
    const isUserMessage = item.sender === "user";
    return (
      <View
        style={[
          styles.messageBubble,
          isUserMessage ? styles.userBubble : styles.botBubble,
        ]}
      >
        {item.isLoading ? (
          <ActivityIndicator size="small" color="#666" />
        ) : (
          <Text
            style={
              isUserMessage ? styles.userMessageText : styles.botMessageText
            }
          >
            {item.text}
          </Text>
        )}
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Assistant</Text>
        <TouchableOpacity onPress={deleteChat}>
          <Icon name="delete" size={28} color="red" />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        inverted={false}
      />

      {/* Chat Input */}
      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInput}
          placeholder="Type your health concern..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={styles.sendButton}
          disabled={isLoading || !inputText.trim()}
        >
          <Icon name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#4CAF50",
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    flex: 1,
  },
  messagesContainer: {
    padding: 10,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    marginVertical: 5,
    borderRadius: 15,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#4CAF50",
    marginLeft: "20%",
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#e0e0e0",
    marginRight: "20%",
  },
  userMessageText: {
    color: "white",
  },
  botMessageText: {
    color: "black",
  },
  timestamp: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  chatInputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  chatInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    backgroundColor: "white",
  },
  sendButton: {
    backgroundColor: "#4CAF50",
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatScreen;
