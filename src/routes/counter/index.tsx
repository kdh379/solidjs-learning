import { createSignal } from "solid-js";
import { Button } from "~/components/ui/Button";

export default function Counter() {
  const [count, setCount] = createSignal(0);

  const handleIncrement = () => {
    setCount((c) => c + 1);
  };

  return (
    <div class="flex h-screen flex-col items-center justify-center">
      <Button onClick={handleIncrement}>Increment</Button>
      <p class="text-2xl font-bold">Count value is {count()}</p>
    </div>
  );
}
