import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Task, Status } from "../types";

export function useTasks(searchQuery: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initUser();
  }, []);

  async function initUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      await supabase.auth.signInAnonymously();
    }
    fetchTasks();
  }

  async function fetchTasks() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setTasks(data || []);
    setLoading(false);
  }

  async function createTask(task: Omit<Task, "id" | "user_id" | "created_at">) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("tasks")
      .insert([{ ...task, user_id: user.id }])
      .select()
      .single();

    if (!error && data) setTasks((prev) => [data, ...prev]);
  }

  async function updateTask(id: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    }
  }

  async function deleteTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function moveTask(id: string, status: Status) {
    await updateTask(id, { status });
  }

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return {
    tasks: filteredTasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  };
}
