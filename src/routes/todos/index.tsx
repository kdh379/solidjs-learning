import { clientOnly } from "@solidjs/start";

const ClientOnlyComp = clientOnly(() => import("./todos"));

function TodosPage() {
  return <ClientOnlyComp />;
}

export default TodosPage;
