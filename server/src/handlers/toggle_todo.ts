
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type ToggleTodoInput, type Todo } from '../schema';
import { eq, not } from 'drizzle-orm';

export const toggleTodo = async (input: ToggleTodoInput): Promise<Todo> => {
  try {
    // Update the todo by flipping its isCompleted status
    const result = await db.update(todosTable)
      .set({
        isCompleted: not(todosTable.isCompleted)
      })
      .where(eq(todosTable.id, input.id))
      .returning()
      .execute();

    // Check if todo was found and updated
    if (result.length === 0) {
      throw new Error(`Todo with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Toggle todo failed:', error);
    throw error;
  }
};
