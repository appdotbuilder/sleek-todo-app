
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { getTodos } from '../handlers/get_todos';

describe('getTodos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no todos exist', async () => {
    const result = await getTodos();
    expect(result).toEqual([]);
  });

  it('should return all todos', async () => {
    // Create test todos
    await db.insert(todosTable).values([
      { text: 'First todo', isCompleted: false },
      { text: 'Second todo', isCompleted: true },
      { text: 'Third todo', isCompleted: false }
    ]).execute();

    const result = await getTodos();

    expect(result).toHaveLength(3);
    expect(result[0].text).toBeDefined();
    expect(result[0].isCompleted).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].id).toBeDefined();
  });

  it('should return todos ordered by creation date (newest first)', async () => {
    // Create todos with slight delay to ensure different timestamps
    await db.insert(todosTable).values({
      text: 'First todo',
      isCompleted: false
    }).execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(todosTable).values({
      text: 'Second todo',
      isCompleted: true
    }).execute();

    const result = await getTodos();

    expect(result).toHaveLength(2);
    expect(result[0].text).toEqual('Second todo'); // Most recent first
    expect(result[1].text).toEqual('First todo');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should return todos with correct field types', async () => {
    await db.insert(todosTable).values({
      text: 'Test todo',
      isCompleted: true
    }).execute();

    const result = await getTodos();

    expect(result).toHaveLength(1);
    const todo = result[0];
    expect(typeof todo.id).toBe('number');
    expect(typeof todo.text).toBe('string');
    expect(typeof todo.isCompleted).toBe('boolean');
    expect(todo.created_at).toBeInstanceOf(Date);
  });
});
