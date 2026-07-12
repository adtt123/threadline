import { supabase } from "./supabase";

export async function getContacts() {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getContact(id) {
  const { data, error } = await supabase.from("contacts").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function addContact(contact) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("contacts")
    .insert([{ ...contact, user_id: user.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateContact(id, updates) {
  const { data, error } = await supabase
    .from("contacts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteContact(id) {
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) throw error;
}

export async function getNotes(contactId) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addNote(contactId, content) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("notes")
    .insert([{ contact_id: contactId, user_id: user.id, content }])
    .select()
    .single();
  if (error) throw error;

  await supabase
    .from("contacts")
    .update({ last_contact_date: new Date().toISOString().slice(0, 10) })
    .eq("id", contactId);

  return data;
}

// Sends the raw dictated/typed sentence to the AI proxy and gets back structured fields
export async function extractContactFromText(transcript) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/extract-contact`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ transcript }),
    }
  );
  const json = await response.json();
  if (json.error) throw new Error(json.error);
  return json;
}
