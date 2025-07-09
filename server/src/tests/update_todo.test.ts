
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type UpdateTodoInput } from '../schema';
import { updateTodo } from '../handlers/update_todo';
import { eq } from 'drizzle-orm';

describe('updateTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update todo text', async () => {
    // Create a todo first
    const [createdTodo] = await db.insert(todosTable)
      .values({
        text: 'Original todo',
        isCompleted: false
      })
      .returning()
      .execute();

    const input: UpdateTodoInput = {
      id: createdTodo.id,
      text: 'Updated todo text'
    };

    const result = await updateTodo(input);

    expect(result.id).toEqual(createdTodo.id);
    expect(result.text).toEqual('Updated todo text');
    expect(result.isCompleted).toEqual(false); // Should remain unchanged
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update todo completion status', async () => {
    // Create a todo first
    const [createdTodo] = await db.insert(todosTable)
      .values({
        text: 'Test todo',
        isCompleted: false
      })
      .returning()
      .execute();

    const input: UpdateTodoInput = {
      id: createdTodo.id,
      isCompleted: true
    };

    const result = await updateTodo(input);

    expect(result.id).toEqual(createdTodo.id);
    expect(result.text).toEqual('Test todo'); // Should remain unchanged
    expect(result.isCompleted).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update both text and completion status', async () => {
    // Create a todo first
    const [createdTodo] = await db.insert(todosTable)
      .values({
        text: 'Original todo',
        isCompleted: false
      })
      .returning()
      .execute();

    const input: UpdateTodoInput = {
      id: createdTodo.id,
      text: 'Updated todo text',
      isCompleted: true
    };

    const result = await updateTodo(input);

    expect(result.id).toEqual(createdTodo.id);
    expect(result.text).toEqual('Updated todo text');
    expect(result.isCompleted).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save changes to database', async () => {
    // Create a todo first
    const [createdTodo] = await db.insert(todosTable)
      .values({
        text: 'Original todo',
        isCompleted: false
      })
      .returning()
      .execute();

    const input: UpdateTodoInput = {
      id: createdTodo.id,
      text: 'Updated todo text',
      isCompleted: true
    };

    await updateTodo(input);

    // Query the database to verify changes were saved
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, createdTodo.id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].text).toEqual('Updated todo text');
    expect(todos[0].isCompleted).toEqual(true);
  });

  it('should throw error when todo not found', async () => {
    const input: UpdateTodoInput = {
      id: 999, // Non-existent ID
      text: 'Updated text'
    };

    await expect(updateTodo(input)).rejects.toThrow(/Todo with id 999 not found/i);
  });
});
