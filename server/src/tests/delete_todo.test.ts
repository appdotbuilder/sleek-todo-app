
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type DeleteTodoInput } from '../schema';
import { deleteTodo } from '../handlers/delete_todo';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: DeleteTodoInput = {
  id: 1
};

describe('deleteTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing todo', async () => {
    // Create a todo first
    await db.insert(todosTable)
      .values({
        text: 'Test Todo',
        isCompleted: false
      })
      .execute();

    const result = await deleteTodo(testInput);

    // Should return success
    expect(result.success).toBe(true);
  });

  it('should remove todo from database', async () => {
    // Create a todo first
    await db.insert(todosTable)
      .values({
        text: 'Test Todo',
        isCompleted: false
      })
      .execute();

    await deleteTodo(testInput);

    // Verify todo is deleted from database
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, testInput.id))
      .execute();

    expect(todos).toHaveLength(0);
  });

  it('should return false when todo does not exist', async () => {
    const result = await deleteTodo({ id: 999 });

    // Should return false for non-existent todo
    expect(result.success).toBe(false);
  });

  it('should not affect other todos', async () => {
    // Create multiple todos
    await db.insert(todosTable)
      .values([
        { text: 'Todo 1', isCompleted: false },
        { text: 'Todo 2', isCompleted: true },
        { text: 'Todo 3', isCompleted: false }
      ])
      .execute();

    // Delete the first todo
    await deleteTodo({ id: 1 });

    // Verify other todos still exist
    const remainingTodos = await db.select()
      .from(todosTable)
      .execute();

    expect(remainingTodos).toHaveLength(2);
    expect(remainingTodos.some(todo => todo.id === 1)).toBe(false);
    expect(remainingTodos.some(todo => todo.id === 2)).toBe(true);
    expect(remainingTodos.some(todo => todo.id === 3)).toBe(true);
  });
});
