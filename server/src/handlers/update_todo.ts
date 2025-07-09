
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type UpdateTodoInput, type Todo } from '../schema';
import { eq } from 'drizzle-orm';

export const updateTodo = async (input: UpdateTodoInput): Promise<Todo> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<{
      text: string;
      isCompleted: boolean;
    }> = {};

    if (input.text !== undefined) {
      updateData.text = input.text;
    }

    if (input.isCompleted !== undefined) {
      updateData.isCompleted = input.isCompleted;
    }

    // Update the todo record
    const result = await db.update(todosTable)
      .set(updateData)
      .where(eq(todosTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Todo with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Todo update failed:', error);
    throw error;
  }
};
