import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import { supabase } from "./src/lib/supabase";

import SignInScreen from "./src/screens/SignInScreen";
import PinLockScreen from "./src/screens/PinLockScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ContactsScreen from "./src/screens/ContactsScreen";
import ContactDetailScreen from "./src/screens/ContactDetailScreen";
import AddContactScreen from "./src/screens/AddContactScreen";
import NewsScreen from "./src/screens/NewsScreen";

const Tab = createBottomTabNavigator();
const ContactsStack = createNativeStackNavigator();

function ContactsStackScreen() {
  return (
    <ContactsStack.Navigator screenOptions={{ headerShown: false }}>
      <ContactsStack.Screen name="ContactsList" component={ContactsScreen} />
      <ContactsStack.Screen name="ContactDetail" component={ContactDetailScreen} />
    </ContactsStack.Navigator>
  );
}

function TabIcon({ label }) {
  return <Text style={{ fontSize: 11 }}>{label}</Text>;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (checkingSession) return null;

  // Step 1 (only during setup, once ever): sign in to connect the app to the account
  if (!session) return <SignInScreen />;

  // Step 2 (every time the app opens): enter the 1972 code
  if (!unlocked) return <PinLockScreen onUnlock={() => setUnlocked(true)} />;

  // Step 3: the actual app
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: "#16233A" }}>
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Home" }} />
        <Tab.Screen name="ContactsTab" component={ContactsStackScreen} options={{ tabBarLabel: "Contacts" }} />
        <Tab.Screen name="Add" component={AddContactScreen} options={{ tabBarLabel: "Add" }} />
        <Tab.Screen name="News" component={NewsScreen} options={{ tabBarLabel: "News" }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
