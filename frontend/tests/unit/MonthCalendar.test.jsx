import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { MonthCalendar } from "../../src/components/MonthCalendar";

function renderCalendar(props = {}) {
  const handlers = { onSelectDate: vi.fn(), onChangeMonth: vi.fn() };
  render(
    <MonthCalendar
      year={2026}
      month={11}
      appointments={[]}
      selectedDate="2026-11-20"
      {...handlers}
      {...props}
    />,
  );
  return handlers;
}

it("mostra o mês e todos os dias", () => {
  renderCalendar();

  expect(
    screen.getByRole("heading", { name: "novembro de 2026" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "30" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "31" })).not.toBeInTheDocument();
});

it("marca os dias que têm compromisso", () => {
  renderCalendar({
    appointments: [
      { id: 1, date: "2026-11-05" },
      { id: 2, date: "2026-11-05" },
      { id: 3, date: "2026-11-12" },
    ],
  });

  expect(
    screen.getByRole("button", { name: "5, 2 compromissos" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "12, 1 compromisso" }),
  ).toBeInTheDocument();
});

it("destaca o dia selecionado", () => {
  renderCalendar();

  expect(screen.getByRole("button", { name: "20" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(screen.getByRole("button", { name: "21" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

it("avisa o dia clicado no formato da API", async () => {
  const { onSelectDate } = renderCalendar();

  await userEvent.click(screen.getByRole("button", { name: "7" }));

  expect(onSelectDate).toHaveBeenCalledWith("2026-11-07");
});

it("pede o mês anterior e o próximo", async () => {
  const { onChangeMonth } = renderCalendar();

  await userEvent.click(screen.getByRole("button", { name: "Mês anterior" }));
  await userEvent.click(screen.getByRole("button", { name: "Próximo mês" }));

  expect(onChangeMonth.mock.calls).toEqual([[-1], [1]]);
});
