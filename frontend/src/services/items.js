export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// O backend é a API de Tarefas: o nome do item vai no campo "title"
const TASKS_URL = `${API_URL}/api/v1/tasks`;

function toItem(task) {
  return { id: task.id, name: task.title, description: task.description };
}

async function request(url, options, defaultMessage) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error("Não foi possível conectar à API.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      typeof body.detail === "string" ? body.detail : defaultMessage,
    );
  }

  return response.json();
}

export async function listItems() {
  // A API devolve só 10 tarefas por padrão
  const tasks = await request(
    `${TASKS_URL}?limit=100`,
    undefined,
    "Erro ao carregar os itens.",
  );
  return tasks.map(toItem);
}

export async function createItem({ name, description }) {
  const task = await request(
    TASKS_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: name, description: description || null }),
    },
    "Erro ao cadastrar o item.",
  );
  return toItem(task);
}
