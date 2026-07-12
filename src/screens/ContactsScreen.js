import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TextInput, StyleSheet, RefreshControl, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getContacts } from "../lib/contacts";

export default function ContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await getContacts();
    setContacts(data);
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

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      (c.tags || []).join(" ").toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connections</Text>
      <TextInput
        style={styles.search}
        placeholder="Search by name, company, or tag"
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate("ContactDetail", { id: item.id })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.name?.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.role}>
                {item.role} {item.company ? `· ${item.company}` : ""}
              </Text>
              <View style={styles.tagRow}>
                {(item.tags || []).map((t) => (
                  <Text key={t} style={styles.tag}>
                    {t}
                  </Text>
                ))}
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyText}>
              Connections you add will show up here. Tap the "Add" tab below to add your first
              one, by voice or by typing.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F4EE", paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: "600", color: "#16233A", marginBottom: 14 },
  search: {
    borderWidth: 1,
    borderColor: "#E4DFD3",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E4DFD3",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#4B7A63",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "600" },
  name: { fontWeight: "600", fontSize: 15, color: "#16233A" },
  role: { fontSize: 12.5, color: "#5C6B7A", marginTop: 1 },
  tagRow: { flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" },
  tag: {
    fontSize: 10.5,
    backgroundColor: "#EFEBE1",
    color: "#16233A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  emptyBox: { alignItems: "center", marginTop: 70, paddingHorizontal: 20 },
  emptyTitle: { fontWeight: "600", fontSize: 16, color: "#16233A", marginBottom: 8 },
  emptyText: { textAlign: "center", color: "#5C6B7A", fontSize: 13, lineHeight: 19 },
});
