import { supabase } from "./supabase";

export async function getNews() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/get-news`, {
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });
  const json = await response.json();
  if (json.error) throw new Error(json.error);
  return json.articles || [];
}
