import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "../../src/App";
import { toISODate } from "../../src/utils/calendar";

// O App abre no dia de hoje, então os compromissos de teste são de hoje
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;
const today = toISODate(year, month, now.getDate());

const dentista = {
  id: 1,
  title: "Dentista",
  description: null,
  date: today,
  start_time: "14:00:00",
  end_time: "15:00:00",
};

// Simula a API: cada chamada ao fetch recebe a próxima resposta da lista
function mockApi(...responses) {
  const fetchMock = vi.fn();
  for (const response of responses) {
    fetchMock.mockResolvedValueOnce(response);
  }
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const json = (body, status = 200) => Response.json(body, { status });

it("carrega o mês atual e mostra os compromissos de hoje", async () => {
  const fetchMock = mockApi(json([dentista]));

  render(<App />);

  expect(await screen.findByText("Dentista")).toBeInTheDocument();
  expect(screen.getByText("14:00 – 15:00")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: `${now.getDate()}, 1 compromisso` }),
  ).toBeInTheDocument();
  expect(fetchMock.mock.calls[0][0]).toContain(`?year=${year}&month=${month}`);
});

it("busca o próximo mês ao clicar na seta", async () => {
  const fetchMock = mockApi(json([]), json([]));
  render(<App />);

  await userEvent.click(screen.getByRole("button", { name: "Próximo mês" }));

  const next = month === 12 ? `year=${year + 1}&month=1` : `month=${month + 1}`;
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  expect(fetchMock.mock.calls[1][0]).toContain(next);
});

it("cria um compromisso e ele aparece na lista do dia", async () => {
  const created = { ...dentista, title: "Reunião" };
  const fetchMock = mockApi(json([]), json(created, 201), json([created]));
  render(<App />);

  await userEvent.type(screen.getByLabelText("Título"), "Reunião");
  await userEvent.type(screen.getByLabelText("Início"), "14:00");
  await userEvent.type(screen.getByLabelText("Fim"), "15:00");
  await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

  expect(await screen.findByText("Reunião")).toBeInTheDocument();
  const [url, options] = fetchMock.mock.calls[1];
  expect(url).toMatch(/\/api\/v1\/appointments$/);
  expect(options.method).toBe("POST");
  expect(JSON.parse(options.body)).toMatchObject({
    title: "Reunião",
    date: today,
  });
});

it("mostra o conflito de horário (409) sem salvar", async () => {
  const message = "Horário em conflito com 'Dentista' (14:00 às 15:00)";
  mockApi(json([dentista]), json({ detail: message }, 409));
  render(<App />);
  await screen.findByText("Dentista");

  await userEvent.type(screen.getByLabelText("Título"), "Reunião");
  await userEvent.type(screen.getByLabelText("Início"), "14:30");
  await userEvent.type(screen.getByLabelText("Fim"), "15:30");
  await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(message);
  expect(screen.queryByText("Reunião")).not.toBeInTheDocument();
});

it("edita um compromisso com PUT e volta ao modo de criar", async () => {
  const updated = { ...dentista, title: "Médico" };
  const fetchMock = mockApi(json([dentista]), json(updated), json([updated]));
  render(<App />);

  await userEvent.click(
    await screen.findByRole("button", { name: "Editar Dentista" }),
  );
  const title = screen.getByLabelText("Título");
  await userEvent.clear(title);
  await userEvent.type(title, "Médico");
  await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

  expect(await screen.findByText("Médico")).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Novo compromisso" }),
  ).toBeInTheDocument();
  const [url, options] = fetchMock.mock.calls[1];
  expect(url).toMatch(/\/api\/v1\/appointments\/1$/);
  expect(options.method).toBe("PUT");
});

it("exclui um compromisso com DELETE", async () => {
  const fetchMock = mockApi(
    json([dentista]),
    new Response(null, { status: 204 }),
  );
  render(<App />);

  await userEvent.click(
    await screen.findByRole("button", { name: "Excluir Dentista" }),
  );

  expect(
    await screen.findByText("Nenhum compromisso neste dia."),
  ).toBeInTheDocument();
  expect(fetchMock.mock.calls[1][1]).toEqual({ method: "DELETE" });
});

it("avisa quando a API está fora do ar", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError()));

  render(<App />);

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Não foi possível conectar à API.",
  );
});
