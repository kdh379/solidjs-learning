import { A } from "@solidjs/router";
import { buttonVariants } from "~/components/ui/Button";

export default function Home() {
  return (
    <main class="mx-auto p-4 text-center">
      <A href="/counter" class={buttonVariants({ variant: "link" })}>
        Counter
      </A>
      <A href="/todos" class={buttonVariants({ variant: "link" })}>
        Todos
      </A>
      <A href="/form-validation" class={buttonVariants({ variant: "link" })}>
        Form Validation
      </A>
    </main>
  );
}
