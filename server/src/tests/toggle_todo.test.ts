
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput } from '../schema';
import { toggleTodo } from '../handlers/toggle_todo';
import { eq } from 'drizzle-orm';

// Helper function to create a test todo
const createTestTodo = async (text: string, isCompleted: boolean = false) => {
  const result = await db.insert(todosTable)
    .values({
      text,
      isCompleted
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('toggleTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should toggle incomplete todo to completed', async () => {
    // Create an incomplete todo
    const testTodo = await createTestTodo('Test todo', false);
    
    const result = await toggleTodo({ id: testTodo.id });

    // Verify the todo was toggled to completed
    expect(result.id).toEqual(testTodo.id);
    expect(result.text).toEqual('Test todo');
    expect(result.isCompleted).toBe(true);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should toggle completed todo to incomplete', async () => {
    // Create a completed todo
    const testTodo = await createTestTodo('Completed todo', true);
    
    const result = await toggleTodo({ id: testTodo.id });

    // Verify the todo was toggled to incomplete
    expect(result.id).toEqual(testTodo.id);
    expect(result.text).toEqual('Completed todo');
    expect(result.isCompleted).toBe(false);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save toggled state to database', async () => {
    // Create an incomplete todo
    const testTodo = await createTestTodo('Test todo', false);
    
    const result = await toggleTodo({ id: testTodo.id });

    // Query the database to verify the change was persisted
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, result.id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].isCompleted).toBe(true);
    expect(todos[0].text).toEqual('Test todo');
  });

  it('should throw error for non-existent todo', async () => {
    // Try to toggle a todo that doesn't exist
    expect(toggleTodo({ id: 999 })).rejects.toThrow(/not found/i);
  });

  it('should handle multiple toggles correctly', async () => {
    // Create a todo
    const testTodo = await createTestTodo('Toggle test', false);
    
    // Toggle it to completed
    const firstToggle = await toggleTodo({ id: testTodo.id });
    expect(firstToggle.isCompleted).toBe(true);
    
    // Toggle it back to incomplete
    const secondToggle = await toggleTodo({ id: testTodo.id });
    expect(secondToggle.isCompleted).toBe(false);
    
    // Verify final state in database
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, testTodo.id))
      .execute();

    expect(todos[0].isCompleted).toBe(false);
  });
});
