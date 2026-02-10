'use client';

import { useState } from 'react';
import { useTodos } from '@hello-ai/shared';

export default function Index() {
  const { todos, addTodo, deleteTodo } = useTodos();
  const [input, setInput] = useState('');

  function handleAdd() {
    addTodo(input);
    setInput('');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Todo App</h1>

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
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </form>

        {todos.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No todos yet. Add one above!</p>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm"
              >
                <span className="text-gray-800">{todo.text}</span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        {todos.length > 0 && (
          <p className="text-gray-400 text-sm mt-4 text-center">
            {todos.length} {todos.length === 1 ? 'item' : 'items'}
          </p>
        )}
      </div>
    </div>
  );
}
