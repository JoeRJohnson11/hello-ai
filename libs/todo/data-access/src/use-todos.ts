'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export type TodoFilter = 'all' | 'active' | 'completed';

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid response: ${text.slice(0, 100)}`);
  }
}

async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch('/api/todos');
  const data = await parseJson<{ todos?: { id: string; text: string; completed: boolean }[] }>(res);
  if (!res.ok) throw new Error('Failed to fetch todos');
  return (data.todos ?? []).map((t) => ({ id: t.id, text: t.text, completed: t.completed }));
}

async function createTodo(text: string): Promise<Todo> {
  const res = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const data = await parseJson<{ todo?: Todo; error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? 'Failed to create todo');
  if (!data.todo) throw new Error('No todo in response');
  return data.todo;
}

async function updateTodo(id: string, updates: { completed?: boolean }): Promise<Todo> {
  const res = await fetch(`/api/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await parseJson<{ todo?: Todo; error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? 'Failed to update todo');
  if (!data.todo) throw new Error('No todo in response');
  return data.todo;
}

async function removeTodo(id: string): Promise<void> {
  const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await parseJson<{ error?: string }>(res);
    throw new Error(data.error ?? 'Failed to delete todo');
  }
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchTodos();
      setTodos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load todos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  async function addTodo(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      const todo = await createTodo(trimmed);
      setTodos((prev) => [...prev, todo]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add todo');
    }
  }

  async function toggleTodo(id: string) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const completed = !todo.completed;
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed } : t))
    );
    try {
      const updated = await updateTodo(id, { completed });
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );
    } catch (e) {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t))
      );
      setError(e instanceof Error ? e.message : 'Failed to toggle todo');
    }
  }

  async function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      await removeTodo(id);
    } catch (e) {
      loadTodos();
      setError(e instanceof Error ? e.message : 'Failed to delete todo');
    }
  }

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return {
    todos,
    filteredTodos,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
    isLoading,
    error,
  };
}
