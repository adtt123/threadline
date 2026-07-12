import { supabase } from "./supabase";

export async function getReminders() {
  const { data, error } = await supabase
    .from("reminders")
    .select("*, contacts(name)")
    .order("due_date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addReminder({ title, due_date, related_contact_id }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("reminders")
    .insert([{ title, due_date, related_contact_id: related_contact_id || null, user_id: user.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleReminderDone(id, done) {
  const { data, error } = await supabase
    .from("reminders")
    .update({ done })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteReminder(id) {
  const { error } = await supabase.from("reminders").delete().eq("id", id);
  if (error) throw error;
}
