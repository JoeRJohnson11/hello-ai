import { renderHook, act } from '@testing-library/react';
import { useTodos } from './use-todos';

let now = 1000;
beforeEach(() => {
  now = 1000;
  jest.spyOn(Date, 'now').mockImplementation(() => ++now);
});
afterEach(() => jest.restoreAllMocks());

describe('useTodos', () => {
  it('starts with an empty list', () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toEqual([]);
  });

  // --- Adding ---

  it('adds a todo', () => {
    const { result } = renderHook(() => useTodos());
    act(() => result.current.addTodo('Buy milk'));
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('Buy milk');
    expect(result.current.todos[0].completed).toBe(false);
  });

  it('trims whitespace when adding', () => {
    const { result } = renderHook(() => useTodos());
    act(() => result.current.addTodo('  Walk the dog  '));
    expect(result.current.todos[0].text).toBe('Walk the dog');
  });

  it('ignores empty or whitespace-only input', () => {
    const { result } = renderHook(() => useTodos());
    act(() => result.current.addTodo(''));
    act(() => result.current.addTodo('   '));
    expect(result.current.todos).toHaveLength(0);
  });

  // --- Toggling ---

  it('toggles a todo to completed', () => {
    const { result } = renderHook(() => useTodos());
    act(() => result.current.addTodo('Test toggling'));
    const id = result.current.todos[0].id;

    act(() => result.current.toggleTodo(id));
    expect(result.current.todos[0].completed).toBe(true);
  });

  it('toggles a completed todo back to active', () => {
    const { result } = renderHook(() => useTodos());
    act(() => result.current.addTodo('Toggle twice'));
    const id = result.current.todos[0].id;

    act(() => result.current.toggleTodo(id));
    act(() => result.current.toggleTodo(id));
    expect(result.current.todos[0].completed).toBe(false);
  });

  it('only toggles the targeted todo', () => {
    const { result } = renderHook(() => useTodos());
    act(() => result.current.addTodo('First'));
    act(() => result.current.addTodo('Second'));
    const secondId = result.current.todos[1].id;

    act(() => result.current.toggleTodo(secondId));
    expect(result.current.todos[0].completed).toBe(false);
    expect(result.current.todos[1].completed).toBe(true);
  });

  // --- Deleting ---

  it('deletes a todo by id', () => {
    const { result } = renderHook(() => useTodos());
    act(() => result.current.addTodo('To delete'));
    act(() => result.current.addTodo('To keep'));
    const deleteId = result.current.todos[0].id;

    act(() => result.current.deleteTodo(deleteId));
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('To keep');
  });

  it('does nothing when deleting a non-existent id', () => {
    const { result } = renderHook(() => useTodos());
    act(() => result.current.addTodo('Stay'));
    act(() => result.current.deleteTodo(999));
    expect(result.current.todos).toHaveLength(1);
  });

  // --- Filtering ---

  it('defaults to "all" filter', () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.filter).toBe('all');
  });

  it('shows all todos with "all" filter', () => {
    const { result } = renderHook(() => useTodos());
    act(() => result.current.addTodo('Active'));
    act(() => result.current.addTodo('Done'));
    const doneId = result.current.todos[1].id;
    act(() => result.current.toggleTodo(doneId));

    expect(result.current.filteredTodos).toHaveLength(2);
  });

  it('shows only active todos with "active" filter', () => {
    const { result } = renderHook(() => useTodos());
    act(() => result.current.addTodo('Active'));
    act(() => result.current.addTodo('Done'));
    const doneId = result.current.todos[1].id;
    act(() => result.current.toggleTodo(doneId));

    act(() => result.current.setFilter('active'));
    expect(result.current.filteredTodos).toHaveLength(1);
    expect(result.current.filteredTodos[0].text).toBe('Active');
  });

  it('shows only completed todos with "completed" filter', () => {
    const { result } = renderHook(() => useTodos());
    act(() => result.current.addTodo('Active'));
    act(() => result.current.addTodo('Done'));
    const doneId = result.current.todos[1].id;
    act(() => result.current.toggleTodo(doneId));

    act(() => result.current.setFilter('completed'));
    expect(result.current.filteredTodos).toHaveLength(1);
    expect(result.current.filteredTodos[0].text).toBe('Done');
  });
});
