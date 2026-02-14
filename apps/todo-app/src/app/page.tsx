'use client';
/** nx-agents full-run test */

import { useState } from 'react';
import { AppHeader, Button, TodoCheckIcon } from '@hello-ai/shared-ui';
import { tokens } from '@hello-ai/shared-design';
import { useTodos, type TodoFilter } from '@hello-ai/todo-data-access';

const FILTERS: TodoFilter[] = ['all', 'active', 'completed'];

export default function Index() {
  const {
    todos,
    filteredTodos,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
    isLoading,
    error,
  } = useTodos();
  const [input, setInput] = useState('');

  function handleAdd() {
    addTodo(input);
    setInput('');
  }

  return (
    <main className="min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-lg px-4 py-8">
        <AppHeader appName="todo-app" className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <TodoCheckIcon size={28} className="text-zinc-100" />
            Todos
          </h1>
        </AppHeader>

        {error && (
          <div className="mb-4 rounded-xl border border-red-900/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
          className="flex gap-2 mb-6"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-base sm:text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-600"
          />
          <Button type="submit" variant="primary" size="md">
            Add
          </Button>
        </form>

        <div className="flex gap-1 mb-4">
          {FILTERS.map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        <section
          className="rounded-2xl border border-zinc-800 bg-zinc-950/50"
          style={{ boxShadow: tokens.shadow.md }}
        >
          {isLoading ? (
            <p className="text-zinc-500 text-sm text-center py-8">Loading…</p>
          ) : filteredTodos.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">
              {todos.length === 0
                ? 'No todos yet. Add one above!'
                : 'No matching todos.'}
            </p>
          ) : (
            <ul className="divide-y divide-zinc-800">
              {filteredTodos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <button
                    type="button"
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-all duration-150 ${
                      todo.completed
                        ? 'border-zinc-600 bg-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-600 hover:text-zinc-100'
                        : 'border-zinc-700 bg-zinc-900 text-transparent hover:border-zinc-500 hover:bg-zinc-700'
                    }`}
                    style={{ borderRadius: tokens.radius.sm }}
                    aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {todo.completed && (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <span
                    className={`flex-1 text-sm ${
                      todo.completed ? 'line-through text-zinc-600' : 'text-zinc-100'
                    }`}
                  >
                    {todo.text}
                  </span>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {todos.length > 0 && (
          <p className="text-zinc-500 text-xs mt-3 text-center">
            {todos.filter((t) => !t.completed).length} remaining
          </p>
        )}
      </div>
    </main>
  );
}
