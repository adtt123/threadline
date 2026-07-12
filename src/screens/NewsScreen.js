import React, { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl, Pressable, Linking } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getNews } from "../lib/news";

export default function NewsScreen() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getNews();
      setArticles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Briefing</Text>
      <Text style={styles.sub}>Pulled directly from BBC, NPR, CNBC & MarketWatch</Text>

      <FlatList
        data={articles}
        keyExtractor={(item, i) => item.link || String(i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Pressable style={styles.newsCard} onPress={() => Linking.openURL(item.link)}>
            <Text style={styles.source}>{item.source}</Text>
            <Text style={styles.headline}>{item.title}</Text>
            {item.pubDate && (
              <Text style={styles.meta}>{new Date(item.pubDate).toLocaleString()}</Text>
            )}
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>
              {loading ? "Loading today's briefing..." : error ? "Couldn't load news" : "Nothing here yet"}
            </Text>
            <Text style={styles.emptyText}>
              {error
                ? error
                : loading
                ? "Just a moment."
                : "Pull down to refresh and check again."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F4EE", paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: "600", color: "#16233A" },
  sub: { fontSize: 12.5, color: "#5C6B7A", marginBottom: 14, marginTop: 2 },
  newsCard: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#E4DFD3" },
  source: {
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "#A8794A",
    marginBottom: 5,
    fontWeight: "600",
  },
  headline: { fontSize: 15.5, fontWeight: "600", color: "#16233A", lineHeight: 21 },
  meta: { fontSize: 11, color: "#5C6B7A", marginTop: 6 },
  emptyBox: { alignItems: "center", marginTop: 70, paddingHorizontal: 20 },
  emptyTitle: { fontWeight: "600", fontSize: 15, color: "#16233A", marginBottom: 8 },
  emptyText: { textAlign: "center", color: "#5C6B7A", fontSize: 13, lineHeight: 19 },
});
