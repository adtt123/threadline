import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { APP_PIN } from "../constants/pin";

export default function PinLockScreen({ onUnlock }) {
  const [entered, setEntered] = useState("");
  const [error, setError] = useState(false);

  function pressKey(digit) {
    if (entered.length >= 4) return;
    const next = entered + digit;
    setEntered(next);
    setError(false);

    if (next.length === 4) {
      if (next === APP_PIN) {
        setTimeout(() => onUnlock(), 150);
      } else {
        setError(true);
        setTimeout(() => setEntered(""), 400);
      }
    }
  }

  function pressBackspace() {
    setEntered(entered.slice(0, -1));
    setError(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back, Anupam</Text>
      <Text style={styles.sub}>Headway BPO of America</Text>

      <View style={styles.dotsRow}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < entered.length && styles.dotFilled,
              error && styles.dotError,
            ]}
          />
        ))}
      </View>
      {error && <Text style={styles.errorText}>Incorrect code — try again</Text>}

      <View style={styles.keypad}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
          <Pressable key={n} style={styles.key} onPress={() => pressKey(n)}>
            <Text style={styles.keyText}>{n}</Text>
          </Pressable>
        ))}
        <View style={styles.key} />
        <Pressable style={styles.key} onPress={() => pressKey("0")}>
          <Text style={styles.keyText}>0</Text>
        </Pressable>
        <Pressable style={styles.key} onPress={pressBackspace}>
          <Text style={styles.keyText}>⌫</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F4EE",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 34,
  },
  title: { fontSize: 24, fontWeight: "600", color: "#16233A", marginBottom: 4 },
  sub: { fontSize: 13.5, color: "#5C6B7A", marginBottom: 36 },
  dotsRow: { flexDirection: "row", gap: 16, marginBottom: 12 },
  dot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#A8794A",
  },
  dotFilled: { backgroundColor: "#A8794A" },
  dotError: { borderColor: "#B1502E", backgroundColor: "#B1502E" },
  errorText: { color: "#B1502E", fontSize: 12, marginBottom: 20 },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 260,
    justifyContent: "space-between",
    marginTop: 20,
  },
  key: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E4DFD3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  keyText: { fontSize: 22, color: "#16233A" },
});
