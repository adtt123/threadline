import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Linking,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getContact, updateContact, deleteContact, getNotes, addNote } from "../lib/contacts";

export default function ContactDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [contact, setContact] = useState(null);
  const [notes, setNotes] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [newNote, setNewNote] = useState("");

  const load = useCallback(async () => {
    try {
      const c = await getContact(id);
      const n = await getNotes(id);
      setContact(c);
      setForm(c);
      setNotes(n);
    } catch (err) {
      Alert.alert("Couldn't load contact", err.message);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function saveEdits() {
    try {
      await updateContact(id, {
        name: form.name,
        company: form.company,
        role: form.role,
        how_they_help: form.how_they_help,
        phone: form.phone,
        email: form.email,
        linkedin_url: form.linkedin_url,
      });
      setEditing(false);
      load();
    } catch (err) {
      Alert.alert("Couldn't save", err.message);
    }
  }

  function confirmDelete() {
    Alert.alert("Delete this connection?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteContact(id);
          navigation.goBack();
        },
      },
    ]);
  }

  async function submitNote() {
    if (!newNote.trim()) return;
    try {
      await addNote(id, newNote);
      setNewNote("");
      load();
    } catch (err) {
      Alert.alert("Couldn't add note", err.message);
    }
  }

  if (!contact) {
    return (
      <View style={styles.loadingBox}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>← Back</Text>
        </Pressable>
        <Pressable onPress={() => setEditing(!editing)}>
          <Text style={styles.editLink}>{editing ? "Cancel" : "Edit"}</Text>
        </Pressable>
      </View>

      <View style={styles.profileBlock}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {contact.name?.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </Text>
        </View>

        {editing ? (
          <>
            <TextInput style={styles.input} value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} placeholder="Name" />
            <TextInput style={styles.input} value={form.role} onChangeText={(t) => setForm({ ...form, role: t })} placeholder="Role" />
            <TextInput style={styles.input} value={form.company} onChangeText={(t) => setForm({ ...form, company: t })} placeholder="Company" />
            <TextInput style={styles.input} value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} placeholder="Phone" />
            <TextInput style={styles.input} value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} placeholder="Email" />
            <TextInput style={styles.input} value={form.linkedin_url} onChangeText={(t) => setForm({ ...form, linkedin_url: t })} placeholder="LinkedIn URL" />
            <TextInput
              style={[styles.input, { height: 70 }]}
              multiline
              value={form.how_they_help}
              onChangeText={(t) => setForm({ ...form, how_they_help: t })}
              placeholder="How they can help"
            />
            <Pressable style={styles.button} onPress={saveEdits}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </Pressable>
            <Pressable style={styles.deleteButton} onPress={confirmDelete}>
              <Text style={styles.deleteButtonText}>Delete Connection</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.name}>{contact.name}</Text>
            <Text style={styles.role}>
              {contact.role} {contact.company ? `· ${contact.company}` : ""}
            </Text>
            <View style={styles.tagRow}>
              {(contact.tags || []).map((t) => (
                <Text key={t} style={styles.tag}>{t}</Text>
              ))}
            </View>

            <View style={styles.actionRow}>
              {contact.phone && (
                <Pressable style={styles.actionBtn} onPress={() => Linking.openURL(`tel:${contact.phone}`)}>
                  <Text style={styles.actionText}>Call</Text>
                </Pressable>
              )}
              {contact.email && (
                <Pressable style={styles.actionBtn} onPress={() => Linking.openURL(`mailto:${contact.email}`)}>
                  <Text style={styles.actionText}>Email</Text>
                </Pressable>
              )}
              {contact.linkedin_url && (
                <Pressable style={styles.actionBtn} onPress={() => Linking.openURL(contact.linkedin_url)}>
                  <Text style={styles.actionText}>LinkedIn</Text>
                </Pressable>
              )}
            </View>

            <Text style={styles.sectionLabel}>How they can help</Text>
            <View style={styles.card}>
              <Text style={styles.helpText}>
                {contact.how_they_help || "Nothing added yet — tap Edit above to fill this in."}
              </Text>
            </View>
          </>
        )}
      </View>

      <Text style={styles.sectionLabel}>Notes</Text>
      <View style={styles.card}>
        <TextInput
          style={[styles.input, { marginBottom: 8 }]}
          placeholder="Add a note about this connection..."
          value={newNote}
          onChangeText={setNewNote}
        />
        <Pressable style={styles.smallButton} onPress={submitNote}>
          <Text style={styles.buttonText}>Add Note</Text>
        </Pressable>

        {notes.length === 0 ? (
          <Text style={[styles.helpText, { marginTop: 14 }]}>
            No notes yet — anything you add will appear here as a timeline.
          </Text>
        ) : (
          notes.map((n) => (
            <View key={n.id} style={styles.noteRow}>
              <Text style={styles.noteDate}>{new Date(n.created_at).toLocaleDateString()}</Text>
              <Text style={styles.noteContent}>{n.content}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F4EE", paddingTop: 60, paddingHorizontal: 20 },
  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F7F4EE" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  backLink: { color: "#16233A", fontWeight: "600" },
  editLink: { color: "#A8794A", fontWeight: "600" },
  profileBlock: { alignItems: "center", marginBottom: 10 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#4B7A63",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 22 },
  name: { fontSize: 21, fontWeight: "700", color: "#16233A" },
  role: { fontSize: 13, color: "#5C6B7A", marginTop: 2 },
  tagRow: { flexDirection: "row", gap: 6, marginTop: 10, flexWrap: "wrap", justifyContent: "center" },
  tag: {
    fontSize: 10.5,
    backgroundColor: "#EFEBE1",
    color: "#16233A",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 16, width: "100%" },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E4DFD3",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  actionText: { color: "#16233A", fontWeight: "600", fontSize: 13 },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#A8794A",
    marginTop: 22,
    marginBottom: 8,
    fontWeight: "600",
  },
  card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E4DFD3", borderRadius: 16, padding: 16, width: "100%" },
  helpText: { fontSize: 13.5, color: "#25344C", lineHeight: 19 },
  input: {
    borderWidth: 1,
    borderColor: "#E4DFD3",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    width: "100%",
  },
  button: { backgroundColor: "#16233A", borderRadius: 14, padding: 15, alignItems: "center", width: "100%", marginTop: 6 },
  smallButton: { backgroundColor: "#16233A", borderRadius: 12, padding: 12, alignItems: "center" },
  buttonText: { color: "#F7F4EE", fontWeight: "600" },
  deleteButton: { marginTop: 12, alignItems: "center", padding: 10 },
  deleteButtonText: { color: "#B1502E", fontWeight: "600" },
  noteRow: { marginTop: 14, borderTopWidth: 1, borderTopColor: "#E4DFD3", paddingTop: 10 },
  noteDate: { fontSize: 10.5, color: "#5C6B7A", marginBottom: 3 },
  noteContent: { fontSize: 13, color: "#25344C" },
});
