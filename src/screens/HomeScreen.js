import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getContacts } from "../lib/contacts";
import { getReminders, addReminder, toggleReminderDone, deleteReminder } from "../lib/reminders";
import { getExpenses, addExpense, deleteExpense, getMonthTotal } from "../lib/expenses";

export default function HomeScreen() {
  const [contacts, setContacts] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const [reminderModal, setReminderModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderDate, setNewReminderDate] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseDesc, setNewExpenseDesc] = useState("");

  const load = useCallback(async () => {
    try {
      const [c, r, total] = await Promise.all([getContacts(), getReminders(), getMonthTotal()]);
      setContacts(c);
      setReminders(r.filter((x) => !x.done));
      setMonthTotal(total);
    } catch (err) {
      Alert.alert("Couldn't load your data", err.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const staleContacts = contacts
    .filter((c) => {
      const days = (Date.now() - new Date(c.last_contact_date).getTime()) / 86400000;
      return days > 14;
    })
    .slice(0, 5);

  async function submitReminder() {
    if (!newReminderTitle.trim()) return;
    try {
      await addReminder({ title: newReminderTitle, due_date: newReminderDate || null });
      setNewReminderTitle("");
      setNewReminderDate("");
      setReminderModal(false);
      load();
    } catch (err) {
      Alert.alert("Couldn't add reminder", err.message);
    }
  }

  async function submitExpense() {
    const amount = parseFloat(newExpenseAmount);
    if (!amount || isNaN(amount)) {
      Alert.alert("Enter a valid amount", "e.g. 120.50");
      return;
    }
    try {
      await addExpense({ amount, description: newExpenseDesc });
      setNewExpenseAmount("");
      setNewExpenseDesc("");
      setExpenseModal(false);
      load();
    } catch (err) {
      Alert.alert("Couldn't add expense", err.message);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Good day, Anupam</Text>
      <Text style={styles.sub}>Headway BPO of America</Text>

      <Text style={styles.sectionLabel}>Follow up soon</Text>
      <View style={styles.card}>
        {staleContacts.length === 0 ? (
          <Text style={styles.emptyText}>
            Nothing here yet — connections you haven't spoken with in a while will show up here
            so nobody falls through the cracks.
          </Text>
        ) : (
          staleContacts.map((c) => (
            <View key={c.id} style={styles.row}>
              <Text style={styles.rowTitle}>{c.name}</Text>
              <Text style={styles.rowSub}>
                {c.role} {c.company ? `· ${c.company}` : ""}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionLabel}>Deadlines & reminders</Text>
        <Pressable onPress={() => setReminderModal(true)}>
          <Text style={styles.addLink}>+ Add</Text>
        </Pressable>
      </View>
      <View style={styles.card}>
        {reminders.length === 0 ? (
          <Text style={styles.emptyText}>
            No reminders yet — tap "+ Add" above to add your first deadline or task.
          </Text>
        ) : (
          reminders.map((r) => (
            <View key={r.id} style={styles.reminderRow}>
              <Pressable onPress={() => toggleReminderDone(r.id, true).then(load)} style={styles.checkbox} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{r.title}</Text>
                <Text style={styles.rowSub}>
                  {r.due_date ? `Due ${r.due_date}` : "No date set"}
                  {r.contacts?.name ? ` · with ${r.contacts.name}` : ""}
                </Text>
              </View>
              <Pressable onPress={() => deleteReminder(r.id).then(load)}>
                <Text style={styles.deleteLink}>Remove</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionLabel}>This month's expenses</Text>
        <Pressable onPress={() => setExpenseModal(true)}>
          <Text style={styles.addLink}>+ Add</Text>
        </Pressable>
      </View>
      <View style={[styles.card, styles.expenseCard]}>
        <View>
          <Text style={styles.expenseTotal}>${monthTotal.toFixed(2)}</Text>
          <Text style={styles.rowSub}>
            {monthTotal === 0
              ? "Nothing logged yet — tap + Add to track your first expense."
              : "Logged this month"}
          </Text>
        </View>
      </View>

      {/* Add Reminder Modal */}
      <Modal visible={reminderModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Reminder</Text>
            <TextInput
              style={styles.input}
              placeholder="What do you need to remember?"
              value={newReminderTitle}
              onChangeText={setNewReminderTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Due date (YYYY-MM-DD) — optional"
              value={newReminderDate}
              onChangeText={setNewReminderDate}
            />
            <Pressable style={styles.button} onPress={submitReminder}>
              <Text style={styles.buttonText}>Save Reminder</Text>
            </Pressable>
            <Pressable onPress={() => setReminderModal(false)} style={{ marginTop: 10 }}>
              <Text style={styles.cancelLink}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Add Expense Modal */}
      <Modal visible={expenseModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Expense</Text>
            <TextInput
              style={styles.input}
              placeholder="Amount (e.g. 120.50)"
              keyboardType="decimal-pad"
              value={newExpenseAmount}
              onChangeText={setNewExpenseAmount}
            />
            <TextInput
              style={styles.input}
              placeholder="What was it for?"
              value={newExpenseDesc}
              onChangeText={setNewExpenseDesc}
            />
            <Pressable style={styles.button} onPress={submitExpense}>
              <Text style={styles.buttonText}>Save Expense</Text>
            </Pressable>
            <Pressable onPress={() => setExpenseModal(false)} style={{ marginTop: 10 }}>
              <Text style={styles.cancelLink}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F4EE", paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: "600", color: "#16233A" },
  sub: { fontSize: 13, color: "#5C6B7A", marginBottom: 10, marginTop: 2 },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#A8794A",
    marginTop: 22,
    marginBottom: 8,
    fontWeight: "600",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
  },
  addLink: { color: "#A8794A", fontWeight: "600", fontSize: 13 },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E4DFD3",
    borderRadius: 16,
    padding: 16,
  },
  expenseCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  expenseTotal: { fontSize: 24, fontWeight: "700", color: "#16233A" },
  row: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#E4DFD3" },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E4DFD3",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#A8794A",
  },
  rowTitle: { fontWeight: "600", fontSize: 14, color: "#16233A" },
  rowSub: { fontSize: 12, color: "#5C6B7A", marginTop: 2 },
  deleteLink: { color: "#B1502E", fontSize: 12 },
  emptyText: { color: "#5C6B7A", fontSize: 13, lineHeight: 19 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(22,35,58,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#F7F4EE", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#16233A", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#E4DFD3",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 13,
    marginBottom: 12,
  },
  button: { backgroundColor: "#16233A", borderRadius: 14, padding: 15, alignItems: "center" },
  buttonText: { color: "#F7F4EE", fontWeight: "600" },
  cancelLink: { textAlign: "center", color: "#5C6B7A" },
});
