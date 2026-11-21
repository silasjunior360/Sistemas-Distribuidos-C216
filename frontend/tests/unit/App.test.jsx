import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import App from "../../src/App";

it("mostra o título e o calendário do mês", async () => {
  // O App busca o mês ao abrir: simula a API respondendo uma lista vazia
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json([])));

  render(<App />);

  expect(
    screen.getByRole("heading", { name: "Agenda de Compromissos" }),
  ).toBeInTheDocument();
  expect(
    await screen.findByRole("button", { name: "Próximo mês" }),
  ).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledOnce();
});
