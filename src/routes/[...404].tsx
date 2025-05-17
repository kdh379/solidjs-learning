import { A } from "@solidjs/router";
import { AlertTriangle } from "lucide-solid";

export default function NotFound() {
  return (
    <main class="mx-auto p-4 text-center">
      <h1 class="max-6-xs my-16 text-6xl font-thin uppercase">
        <AlertTriangle class="text-error mx-auto size-12" />
      </h1>
      <p class="mt-8">404 여기는 어디 나는 누구?</p>
      <p class="my-4">
        <A href="/" class="text-sky-600 hover:underline">
          Home
        </A>
        {" - "}
        <A href="/about" class="text-sky-600 hover:underline">
          About Page
        </A>
      </p>
    </main>
  );
}
