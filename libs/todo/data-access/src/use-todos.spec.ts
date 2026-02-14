import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodos } from './use-todos.js';

const mockFetch = jest.fn();
beforeEach(() => {
  mockFetch.mockReset();
  (global as unknown as { fetch: typeof fetch }).fetch = mockFetch;
});

beforeEach(() => {
  mockFetch.mockImplementation((url: string, init?: RequestInit) => {
    const path = typeof url === 'string' ? url : (url as URL).href;
    if (path.endsWith('/api/todos') && init?.method !== 'POST') {
      return Promise.resolve(
        new Response(JSON.stringify({ todos: [] }), {
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }
    if (path.endsWith('/api/todos') && init?.method === 'POST') {
      const body = JSON.parse((init?.body as string) ?? '{}');
      const todo = {
        id: `mock-${Date.now()}`,
        text: body.text ?? '',
        completed: false,
      };
      return Promise.resolve(
        new Response(JSON.stringify({ todo }), {
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }
    if (path.includes('/api/todos/') && init?.method === 'PATCH') {
      const body = JSON.parse((init?.body as string) ?? '{}');
      const id = path.split('/').pop() ?? '';
      return Promise.resolve(
        new Response(
          JSON.stringify({
            todo: { id, text: 'x', completed: body.completed ?? false },
          }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      );
    }
    if (path.includes('/api/todos/') && init?.method === 'DELETE') {
      return Promise.resolve(
        new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }
    return Promise.reject(new Error(`Unmocked: ${path} ${init?.method}`));
  });
});

describe('useTodos', () => {
  it('starts with an empty list and loads', async () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toEqual([]);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/todos');
  });

  it('adds a todo', async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.addTodo('Buy milk');
    });
    await waitFor(() => {
      expect(result.current.todos).toHaveLength(1);
    });
    expect(result.current.todos[0].text).toBe('Buy milk');
    expect(result.current.todos[0].completed).toBe(false);
  });

  it('trims whitespace when adding', async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.addTodo('  Walk the dog  ');
    });
    await waitFor(() => {
      expect(result.current.todos).toHaveLength(1);
    });
    expect(result.current.todos[0].text).toBe('Walk the dog');
  });

  it('ignores empty or whitespace-only input', async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.addTodo('');
      result.current.addTodo('   ');
    });
    expect(result.current.todos).toHaveLength(0);
  });

  it('toggles a todo to completed', async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => result.current.addTodo('Test toggling'));
    await waitFor(() => expect(result.current.todos).toHaveLength(1));
    const id = result.current.todos[0].id;

    await act(async () => result.current.toggleTodo(id));
    expect(result.current.todos[0].completed).toBe(true);
  });

  it('toggles a completed todo back to active', async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => result.current.addTodo('Toggle twice'));
    await waitFor(() => expect(result.current.todos).toHaveLength(1));
    const id = result.current.todos[0].id;

    await act(async () => result.current.toggleTodo(id));
    await act(async () => result.current.toggleTodo(id));
    expect(result.current.todos[0].completed).toBe(false);
  });

  it('only toggles the targeted todo', async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.addTodo('First');
      result.current.addTodo('Second');
    });
    await waitFor(() => expect(result.current.todos).toHaveLength(2));
    const secondId = result.current.todos[1].id;

    await act(async () => result.current.toggleTodo(secondId));
    expect(result.current.todos[0].completed).toBe(false);
    expect(result.current.todos[1].completed).toBe(true);
  });

  it('deletes a todo by id', async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.addTodo('To delete');
      result.current.addTodo('To keep');
    });
    await waitFor(() => expect(result.current.todos).toHaveLength(2));
    const deleteId = result.current.todos[0].id;

    await act(async () => result.current.deleteTodo(deleteId));
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('To keep');
  });

  it('restores state when deleting a non-existent id fails', async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => result.current.addTodo('Stay'));
    await waitFor(() => expect(result.current.todos).toHaveLength(1));

    mockFetch.mockImplementationOnce(() => Promise.reject(new Error('404')));
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            todos: [{ id: 'stay-id', text: 'Stay', completed: false }],
          }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    await act(async () => result.current.deleteTodo('non-existent-id'));
    await waitFor(() => expect(result.current.todos).toHaveLength(1));
    expect(result.current.todos[0].text).toBe('Stay');
  });

  it('defaults to "all" filter', async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.filter).toBe('all');
  });

  it('shows all todos with "all" filter', async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.addTodo('Active');
      result.current.addTodo('Done');
    });
    await waitFor(() => expect(result.current.todos).toHaveLength(2));
    const doneId = result.current.todos[1].id;
    await act(async () => result.current.toggleTodo(doneId));

    act(() => result.current.setFilter('all'));
    expect(result.current.filteredTodos).toHaveLength(2);
  });

  it('shows only active todos with "active" filter', async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.addTodo('Active');
      result.current.addTodo('Done');
    });
    await waitFor(() => expect(result.current.todos).toHaveLength(2));
    const doneId = result.current.todos[1].id;
    await act(async () => result.current.toggleTodo(doneId));

    act(() => result.current.setFilter('active'));
    expect(result.current.filteredTodos).toHaveLength(1);
    expect(result.current.filteredTodos[0].text).toBe('Active');
  });

  it('shows only completed todos with "completed" filter', async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.addTodo('Active');
      result.current.addTodo('Done');
    });
    await waitFor(() => expect(result.current.todos).toHaveLength(2));
    const doneId = result.current.todos[1].id;
    await act(async () => result.current.toggleTodo(doneId));

    act(() => result.current.setFilter('completed'));
    expect(result.current.filteredTodos).toHaveLength(1);
    expect(result.current.filteredTodos[0].text).toBe('Done');
  });
});
