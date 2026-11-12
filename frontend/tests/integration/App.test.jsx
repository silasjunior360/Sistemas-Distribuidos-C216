import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "../../src/App";

// Imita uma resposta do fetch: a API não é chamada de verdade nestes testes
function jsonResponse(data, status = 200) {
  return { ok: status < 400, json: async () => data };
}

it("mostra carregando enquanto a API não responde", () => {
  vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
  render(<App />);

  expect(screen.getByText("Carregando itens...")).toBeInTheDocument();
});

it("envia o POST e exibe o item cadastrado", async () => {
  const created = { id: 1, title: "Notebook", description: null };
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(jsonResponse([]))
    .mockResolvedValueOnce(jsonResponse(created, 201));
  vi.stubGlobal("fetch", fetchMock);
  const user = userEvent.setup();
  render(<App />);

  await user.type(screen.getByLabelText("Nome"), "Notebook");
  await user.click(screen.getByRole("button", { name: "Adicionar" }));

  expect(await screen.findByText("Notebook")).toBeInTheDocument();
  expect(fetchMock).toHaveBeenLastCalledWith(
    "http://localhost:8000/api/v1/tasks",
    expect.objectContaining({ method: "POST" }),
  );
});

it("mostra o erro 409 e mantém o que foi digitado", async () => {
  const conflict = { detail: "Já existe uma tarefa com esse título" };
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse(conflict, 409)),
  );
  const user = userEvent.setup();
  render(<App />);

  await user.type(screen.getByLabelText("Nome"), "Notebook");
  await user.click(screen.getByRole("button", { name: "Adicionar" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(conflict.detail);
  expect(screen.getByLabelText("Nome")).toHaveValue("Notebook");
});
