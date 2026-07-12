import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { supabase } from "../lib/supabase";

// This screen is only ever seen ONCE — during setup, to connect the app to
// Anupam's one and only account. After that, the app stays signed in forever
// and the daily "unlock" is just the 1972 PIN screen, not this one.

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert("Missing info", "Please enter both the email and password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert("Sign in failed", error.message);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>One-time setup</Text>
      <Text style={styles.sub}>
        Sign in once with the account created in Supabase. After this, the app will always be
        signed in — daily unlocking is just the 1972 code.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.button} onPress={handleSignIn} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Connecting..." : "Connect Account"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 28, backgroundColor: "#F7F4EE" },
  title: { fontSize: 24, fontWeight: "600", color: "#16233A", marginBottom: 8 },
  sub: { fontSize: 13.5, color: "#5C6B7A", marginBottom: 28, lineHeight: 19 },
  input: {
    borderWidth: 1,
    borderColor: "#E4DFD3",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  button: { backgroundColor: "#16233A", borderRadius: 14, padding: 16, alignItems: "center" },
  buttonText: { color: "#F7F4EE", fontWeight: "600", fontSize: 15 },
});
