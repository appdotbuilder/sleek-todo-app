
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit3, Plus, CheckCircle2, Circle } from 'lucide-react';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../../server/src/schema';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editText, setEditText] = useState('');

  const loadTodos = useCallback(async () => {
    try {
      const result = await trpc.getTodos.query();
      setTodos(result);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    setIsLoading(true);
    try {
      const todoData: CreateTodoInput = { text: newTodoText.trim() };
      const newTodo = await trpc.createTodo.mutate(todoData);
      setTodos((prev: Todo[]) => [...prev, newTodo]);
      setNewTodoText('');
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const updatedTodo = await trpc.toggleTodo.mutate({ id: todo.id });
      setTodos((prev: Todo[]) =>
        prev.map((t: Todo) => (t.id === todo.id ? updatedTodo : t))
      );
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleUpdateTodo = async () => {
    if (!editingTodo || !editText.trim()) return;

    try {
      const updateData: UpdateTodoInput = {
        id: editingTodo.id,
        text: editText.trim()
      };
      const updatedTodo = await trpc.updateTodo.mutate(updateData);
      setTodos((prev: Todo[]) =>
        prev.map((t: Todo) => (t.id === editingTodo.id ? updatedTodo : t))
      );
      setEditingTodo(null);
      setEditText('');
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    try {
      await trpc.deleteTodo.mutate({ id: todoId });
      setTodos((prev: Todo[]) => prev.filter((t: Todo) => t.id !== todoId));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo);
    setEditText(todo.text);
  };

  const cancelEditing = () => {
    setEditingTodo(null);
    setEditText('');
  };

  const completedCount = todos.filter((todo: Todo) => todo.isCompleted).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">✨ Todo App</h1>
          <p className="text-gray-600">Stay organized and get things done</p>
          {totalCount > 0 && (
            <div className="mt-4 flex justify-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {completedCount} / {totalCount} completed
              </Badge>
            </div>
          )}
        </div>

        {/* Add Todo Form */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleCreateTodo} className="flex gap-3">
              <Input
                placeholder="What needs to be done? 🎯"
                value={newTodoText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTodoText(e.target.value)}
                className="flex-1 border-0 bg-gray-50 focus:bg-white transition-colors"
                required
              />
              <Button
                type="submit"
                disabled={isLoading || !newTodoText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
              >
                {isLoading ? '...' : <Plus className="w-4 h-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500 text-lg">No todos yet. Add one above to get started!</p>
              </CardContent>
            </Card>
          ) : (
            todos.map((todo: Todo) => (
              <Card
                key={todo.id}
                className={`shadow-sm border-0 transition-all duration-200 hover:shadow-md ${
                  todo.isCompleted 
                    ? 'bg-green-50/80 backdrop-blur-sm' 
                    : 'bg-white/80 backdrop-blur-sm'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(todo)}
                      className="flex-shrink-0 transition-colors hover:scale-110"
                    >
                      {todo.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 hover:text-indigo-600" />
                      )}
                    </button>

                    {/* Todo Text */}
                    <div className="flex-1 min-w-0">
                      {editingTodo?.id === todo.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editText}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditText(e.target.value)}
                            className="flex-1 border-0 bg-gray-50 focus:bg-white"
                            autoFocus
                          />
                          <Button
                            onClick={handleUpdateTodo}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={cancelEditing}
                            size="sm"
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-gray-800 ${
                              todo.isCompleted ? 'line-through text-gray-500' : ''
                            }`}
                          >
                            {todo.text}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {todo.created_at.toLocaleDateString()}
                            </span>
                            <Button
                              onClick={() => startEditing(todo)}
                              size="sm"
                              variant="ghost"
                              className="text-gray-500 hover:text-indigo-600 p-1"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-gray-500 hover:text-red-600 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Todo</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{todo.text}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteTodo(todo.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        {todos.length > 0 && (
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>🚀 Keep going! You've got this!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
