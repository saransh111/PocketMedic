import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import SchedulesScreen from "../screens/SchedulesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import BookingScreen from "../screens/BookingScreen";
import MedicineScreen from "../screens/MedicineScreen";
import ChatScreen from "../screens/ChatScreen";
import TrackerScreen from "../screens/TrackerScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Schedules") iconName = "calendar-clock";
          else if (route.name === "Booking") iconName = "calendar-plus";
          else if (route.name === "Medicine") iconName = "pill";
          else if (route.name === "Chat") iconName = "chat";
          else if (route.name === "Tracker") iconName = "map-marker-path";
          else if (route.name === "Profile") iconName = "account";
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#0057d9",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Schedules"
        component={SchedulesScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Booking"
        component={BookingScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Medicine"
        component={MedicineScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      {/* <Tab.Screen
        name="Tracker"
        component={TrackerScreen}
        options={{ headerShown: false }}
      /> */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
