import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import Voice from "@react-native-voice/voice";
import { extractContactFromText, addContact } from "../lib/contacts";

export default function AddContactScreen({ navigation }) {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Voice.onSpeechResults = (e) => {
      const text = e.value?.[0] || "";
      setTranscript(text);
    };
    Voice.onSpeechEnd = () => setListening(false);
    Voice.onSpeechError = (e) => {
      setListening(false);
      Alert.alert(
        "Didn't catch that",
        "Voice recognition had trouble hearing you — you can also just type instead."
      );
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  async function startListening() {
    try {
      setTranscript("");
      setExtracted(null);
      setListening(true);
      await Voice.start("en-US");
    } catch (err) {
      setListening(false);
      Alert.alert("Microphone unavailable", String(err));
    }
  }

  async function stopListening() {
    try {
      await Voice.stop();
    } catch (err) {
      // ignore
    }
    setListening(false);
  }

  async function handleExtract() {
    if (!transcript.trim()) return;
    setLoading(true);
    try {
      const result = await extractContactFromText(transcript);
      setExtracted(result);
    } catch (err) {
      Alert.alert("Couldn't parse that", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      await addContact({
        name: extracted.name,
        company: extracted.company,
        role: extracted.role,
        tags: extracted.tags || [],
        how_they_help: extracted.how_they_help,
        met_context: extracted.met_context,
      });
      Alert.alert("Saved", `${extracted.name} added to your connections.`);
      setTranscript("");
      setExtracted(null);
      navigation.navigate("ContactsTab");
    } catch (err) {
      Alert.alert("Save failed", err.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Connection</Text>
      <Text style={styles.hint}>
        Tap the microphone and speak naturally, or type below — e.g. "Add Lauren Mitchell, VP
        Ops at Harborview, she's the decision-maker on the renewal."
      </Text>

      <Pressable
        style={[styles.micButton, listening && styles.micButtonActive]}
        onPress={listening ? stopListening : startListening}
      >
        <Text style={styles.micIcon}>{listening ? "■" : "🎙"}</Text>
      </Pressable>
      <Text style={styles.micLabel}>{listening ? "Listening... tap to stop" : "Tap to speak"}</Text>

      <TextInput
        style={styles.transcriptBox}
        placeholder="Or type here instead..."
        multiline
        value={transcript}
        onChangeText={setTranscript}
      />

      <Pressable style={styles.button} onPress={handleExtract} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Parse with AI</Text>}
      </Pressable>

      {extracted && !extracted.error && (
        <View style={styles.resultCard}>
          <Field label="Name" value={extracted.name} />
          <Field label="Company / Role" value={`${extracted.company || "—"} · ${extracted.role || "—"}`} />
          <Field label="Tags" value={(extracted.tags || []).join(", ") || "—"} />
          <Field label="How they help" value={extracted.how_they_help || "—"} />

          <Pressable style={[styles.button, { marginTop: 16 }]} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Connection</Text>
          </Pressable>
        </View>
      )}

      {extracted?.error && (
        <Text style={styles.errorText}>{extracted.error}</Text>
      )}
    </View>
  );
}

function Field({ label, value }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F4EE", paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "600", color: "#16233A", marginBottom: 8 },
  hint: { fontSize: 12.5, color: "#5C6B7A", marginBottom: 20, lineHeight: 18 },
  micButton: {
    alignSelf: "center",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#A8794A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  micButtonActive: { backgroundColor: "#B1502E" },
  micIcon: { fontSize: 30 },
  micLabel: { textAlign: "center", color: "#5C6B7A", fontSize: 12, marginBottom: 20 },
  transcriptBox: {
    borderWidth: 1,
    borderColor: "#E4DFD3",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 14,
  },
  button: { backgroundColor: "#16233A", borderRadius: 14, padding: 15, alignItems: "center" },
  buttonText: { color: "#F7F4EE", fontWeight: "600", fontSize: 14.5 },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#E4DFD3",
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E4DFD3",
  },
  fieldLabel: { fontSize: 11, color: "#5C6B7A", textTransform: "uppercase" },
  fieldValue: { fontSize: 13.5, fontWeight: "600", color: "#16233A", flexShrink: 1, textAlign: "right" },
  errorText: { color: "#B1502E", textAlign: "center", marginTop: 16 },
});
