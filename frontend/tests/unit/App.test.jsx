import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import App from "../../src/App";

it("mostra o título da agenda", () => {
  render(<App />);

  expect(
    screen.getByRole("heading", { name: "Agenda de Compromissos" }),
  ).toBeInTheDocument();
});
