
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type DeleteTodoInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteTodo = async (input: DeleteTodoInput): Promise<{ success: boolean }> => {
  try {
    // Delete todo record by ID
    const result = await db.delete(todosTable)
      .where(eq(todosTable.id, input.id))
      .execute();

    // Return success status based on whether a row was deleted
    return { success: (result.rowCount ?? 0) > 0 };
  } catch (error) {
    console.error('Todo deletion failed:', error);
    throw error;
  }
};
