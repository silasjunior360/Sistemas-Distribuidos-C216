import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { AppointmentForm } from "../../src/components/AppointmentForm";

async function fillTimes(start, end) {
  await userEvent.type(screen.getByLabelText("Início"), start);
  await userEvent.type(screen.getByLabelText("Fim"), end);
}

it("cria com a data do dia escolhido e limpa depois de salvar", async () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(<AppointmentForm defaultDate="2026-11-20" onSubmit={onSubmit} />);

  expect(
    screen.getByRole("heading", { name: "Novo compromisso" }),
  ).toBeInTheDocument();
  await userEvent.type(screen.getByLabelText("Título"), "Dentista");
  await fillTimes("14:00", "15:00");
  await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

  expect(onSubmit).toHaveBeenCalledWith({
    title: "Dentista",
    description: "",
    date: "2026-11-20",
    start_time: "14:00",
    end_time: "15:00",
  });
  expect(screen.getByLabelText("Título")).toHaveValue("");
});

it("edita com os dados do compromisso e permite cancelar", async () => {
  const onCancel = vi.fn();
  render(
    <AppointmentForm
      appointment={{
        id: 1,
        title: "Dentista",
        description: null,
        date: "2026-11-20",
        start_time: "14:00:00",
        end_time: "15:00:00",
      }}
      defaultDate="2026-11-20"
      onSubmit={vi.fn()}
      onCancel={onCancel}
    />,
  );

  expect(
    screen.getByRole("heading", { name: "Editar compromisso" }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Título")).toHaveValue("Dentista");
  expect(screen.getByLabelText("Início")).toHaveValue("14:00");
  await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

  expect(onCancel).toHaveBeenCalled();
});

it("mostra o erro da API e mantém o que foi digitado", async () => {
  const onSubmit = vi
    .fn()
    .mockRejectedValue(new Error("Horário em conflito com 'Dentista'"));
  render(<AppointmentForm defaultDate="2026-11-20" onSubmit={onSubmit} />);

  await userEvent.type(screen.getByLabelText("Título"), "Reunião");
  await fillTimes("14:30", "15:30");
  await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Horário em conflito com 'Dentista'",
  );
  expect(screen.getByLabelText("Título")).toHaveValue("Reunião");
});
