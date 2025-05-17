import { batch, createEffect, createSignal, For } from "solid-js";
import type { SetStoreFunction, Store } from "solid-js/store";
import { createStore } from "solid-js/store";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { Plus, Trash } from "lucide-solid";
import { Checkbox } from "~/components/ui/Checkbox";

function createLocalStorage<T extends object>(
  name: string,
  init: T,
): [Store<T>, SetStoreFunction<T>] {
  const localState = localStorage.getItem(name);
  const [state, setState] = createStore<T>(
    localState ? JSON.parse(localState) : init,
  );
  createEffect(() => localStorage.setItem(name, JSON.stringify(state)));
  return [state, setState];
}

function removeIndex<T>(array: readonly T[], index: number): T[] {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

type TodoItem = { title: string; done: boolean };

export default function Todos() {
  const [newTitle, setTitle] = createSignal("");
  const [todos, setTodos] = createLocalStorage<TodoItem[]>("todo list", []);

  const addTodo = (e: SubmitEvent) => {
    e.preventDefault();

    batch(() => {
      setTodos(todos.length, {
        title: newTitle(),
        done: false,
      });
      setTitle("");
    });
  };

  const removeTodo = (index: number) => {
    setTodos(removeIndex(todos, index));
  };

  return (
    <main class="mx-auto max-w-md p-4">
      <h1 class="text-2xl font-bold">Todos</h1>
      <form onSubmit={addTodo} class="flex gap-2">
        <Input
          placeholder="Add a todo"
          required
          value={newTitle()}
          onInput={(e) => setTitle(e.target.value)}
        />
        <Button intent="primary" isIconOnly>
          <Plus />
        </Button>
      </form>
      <ul class="mt-4 space-y-2 divide-y divide-gray-200 dark:divide-gray-800">
        <For each={todos}>
          {(todo, i) => (
            <li class="flex items-center gap-2 px-4 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
              <Checkbox
                checked={todo.done}
                onChange={(checked) => {
                  setTodos(i(), "done", checked);
                }}
              />
              <span>{todo.title}</span>
              <Button
                intent="error"
                size="sm"
                isIconOnly
                onClick={() => removeTodo(i())}
              >
                <Trash />
              </Button>
            </li>
          )}
        </For>
      </ul>
    </main>
  );
}
