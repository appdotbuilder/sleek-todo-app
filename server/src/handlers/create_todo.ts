
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput, type Todo } from '../schema';

export const createTodo = async (input: CreateTodoInput): Promise<Todo> => {
  try {
    // Insert todo record
    const result = await db.insert(todosTable)
      .values({
        text: input.text,
        isCompleted: false, // Default value
      })
      .returning()
      .execute();

    // Return the created todo
    const todo = result[0];
    return {
      ...todo,
    };
  } catch (error) {
    console.error('Todo creation failed:', error);
    throw error;
  }
};
