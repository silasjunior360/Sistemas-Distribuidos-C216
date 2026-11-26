import { describe, expect, it, vi } from "vitest";
import {
  API_URL,
  createAppointment,
  deleteAppointment,
  listMonth,
  updateAppointment,
} from "../../src/services/appointments";

const URL = `${API_URL}/api/v1/appointments`;

const appointment = {
  title: "Dentista",
  description: "",
  date: "2026-11-20",
  start_time: "14:00",
  end_time: "15:00",
};

// Troca o fetch do navegador por um que devolve a resposta escolhida
function mockFetch(status, body) {
  const response = new Response(body ? JSON.stringify(body) : null, {
    status,
  });
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("chamadas à API", () => {
  it("listMonth busca o mês pelos parâmetros year e month", async () => {
    const fetchMock = mockFetch(200, [{ id: 1, title: "Dentista" }]);

    const result = await listMonth(2026, 11);

    expect(fetchMock).toHaveBeenCalledWith(
      `${URL}?year=2026&month=11`,
      undefined,
    );
    expect(result).toEqual([{ id: 1, title: "Dentista" }]);
  });

  it("createAppointment envia POST com descrição vazia como null", async () => {
    const fetchMock = mockFetch(201, { id: 1, ...appointment });

    await createAppointment(appointment);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(URL);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({
      ...appointment,
      description: null,
    });
  });

  it("updateAppointment envia PUT para o id", async () => {
    const fetchMock = mockFetch(200, { id: 7, ...appointment });

    await updateAppointment(7, appointment);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${URL}/7`);
    expect(options.method).toBe("PUT");
  });

  it("deleteAppointment aceita o 204 sem corpo", async () => {
    const fetchMock = mockFetch(204);

    await expect(deleteAppointment(7)).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(`${URL}/7`, { method: "DELETE" });
  });
});

describe("erros", () => {
  it("usa a mensagem de conflito da API (409)", async () => {
    mockFetch(409, { detail: "Horário em conflito com 'Dentista'" });

    await expect(createAppointment(appointment)).rejects.toThrow(
      "Horário em conflito com 'Dentista'",
    );
  });

  it("usa a primeira mensagem da lista de validação (422)", async () => {
    mockFetch(422, {
      detail: [
        { msg: "Value error, O horário de término deve ser depois do início" },
      ],
    });

    await expect(createAppointment(appointment)).rejects.toThrow(
      /^O horário de término deve ser depois do início$/,
    );
  });

  it("avisa quando não consegue conectar à API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError()));

    await expect(listMonth(2026, 11)).rejects.toThrow(
      "Não foi possível conectar à API.",
    );
  });
});
