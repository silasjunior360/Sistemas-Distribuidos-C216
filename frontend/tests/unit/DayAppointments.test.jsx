import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { DayAppointments } from "../../src/components/DayAppointments";

const appointments = [
  {
    id: 1,
    title: "Dentista",
    description: "Levar exames",
    date: "2026-11-20",
    start_time: "14:00:00",
    end_time: "15:00:00",
  },
  {
    id: 2,
    title: "Reunião",
    description: null,
    date: "2026-11-20",
    start_time: "16:30:00",
    end_time: "17:00:00",
  },
];

it("mostra o dia e os compromissos com horário curto", () => {
  render(
    <DayAppointments
      date="2026-11-20"
      appointments={appointments}
      onDelete={vi.fn()}
    />,
  );

  expect(
    screen.getByRole("heading", { name: "sexta-feira, 20 de novembro" }),
  ).toBeInTheDocument();
  const items = screen.getAllByRole("listitem");
  expect(items[0]).toHaveTextContent("14:00 – 15:00DentistaLevar exames");
  expect(items[1]).toHaveTextContent("16:30 – 17:00Reunião");
});

it("avisa quando o dia não tem compromissos", () => {
  render(
    <DayAppointments date="2026-11-21" appointments={[]} onDelete={vi.fn()} />,
  );

  expect(screen.getByText("Nenhum compromisso neste dia.")).toBeInTheDocument();
});

it("pede para excluir o compromisso clicado", async () => {
  const onDelete = vi.fn();
  render(
    <DayAppointments
      date="2026-11-20"
      appointments={appointments}
      onDelete={onDelete}
    />,
  );

  await userEvent.click(
    screen.getByRole("button", { name: "Excluir Reunião" }),
  );

  expect(onDelete).toHaveBeenCalledWith(2);
});
