
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput } from '../schema';
import { createTodo } from '../handlers/create_todo';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateTodoInput = {
  text: 'Test todo item'
};

describe('createTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a todo', async () => {
    const result = await createTodo(testInput);

    // Basic field validation
    expect(result.text).toEqual('Test todo item');
    expect(result.isCompleted).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save todo to database', async () => {
    const result = await createTodo(testInput);

    // Query using proper drizzle syntax
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, result.id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].text).toEqual('Test todo item');
    expect(todos[0].isCompleted).toEqual(false);
    expect(todos[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple todos independently', async () => {
    const firstTodo = await createTodo({ text: 'First todo' });
    const secondTodo = await createTodo({ text: 'Second todo' });

    expect(firstTodo.id).not.toEqual(secondTodo.id);
    expect(firstTodo.text).toEqual('First todo');
    expect(secondTodo.text).toEqual('Second todo');
    expect(firstTodo.isCompleted).toEqual(false);
    expect(secondTodo.isCompleted).toEqual(false);
  });

  it('should handle long text correctly', async () => {
    const longText = 'This is a very long todo item that should still be handled correctly by the database';
    const result = await createTodo({ text: longText });

    expect(result.text).toEqual(longText);
    expect(result.isCompleted).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });
});
