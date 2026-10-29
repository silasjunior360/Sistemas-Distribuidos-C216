import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { ItemList } from "../../src/components/ItemList";

it("mostra mensagem quando não há itens", () => {
  render(<ItemList items={[]} />);
  expect(screen.getByText("Nenhum item cadastrado.")).toBeInTheDocument();
});

it("lista os itens recebidos", () => {
  render(<ItemList items={[{ id: "1", name: "Mouse", description: "" }]} />);
  expect(screen.getByRole("listitem")).toHaveTextContent("Mouse");
});
