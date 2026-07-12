import { supabase } from "./supabase";

export async function getExpenses() {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addExpense({ amount, category, description, expense_date }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("expenses")
    .insert([
      {
        amount,
        category,
        description,
        expense_date: expense_date || new Date().toISOString().slice(0, 10),
        user_id: user.id,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExpense(id) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}

export async function getMonthTotal() {
  const expenses = await getExpenses();
  const now = new Date();
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.expense_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  return thisMonth.reduce((sum, e) => sum + Number(e.amount), 0);
}
