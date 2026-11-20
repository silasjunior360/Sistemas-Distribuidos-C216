export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const APPOINTMENTS_URL = `${API_URL}/api/v1/appointments`;

// Mensagem de erro vinda da API:
// 404/409 mandam "detail" como texto; 422 (Pydantic) manda uma lista de erros
function errorMessage(detail, defaultMessage) {
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    return detail[0].msg.replace("Value error, ", "");
  }
  return defaultMessage;
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
    throw new Error(errorMessage(body.detail, defaultMessage));
  }

  // DELETE responde 204, sem corpo
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

// Corpo do POST e do PUT; descrição vazia vai como null
function toBody({ title, description, date, start_time, end_time }) {
  return JSON.stringify({
    title,
    description: description || null,
    date,
    start_time,
    end_time,
  });
}

const JSON_HEADERS = { "Content-Type": "application/json" };

export function listMonth(year, month) {
  return request(
    `${APPOINTMENTS_URL}?year=${year}&month=${month}`,
    undefined,
    "Erro ao carregar os compromissos.",
  );
}

export function createAppointment(data) {
  return request(
    APPOINTMENTS_URL,
    { method: "POST", headers: JSON_HEADERS, body: toBody(data) },
    "Erro ao criar o compromisso.",
  );
}

export function updateAppointment(id, data) {
  return request(
    `${APPOINTMENTS_URL}/${id}`,
    { method: "PUT", headers: JSON_HEADERS, body: toBody(data) },
    "Erro ao editar o compromisso.",
  );
}

export function deleteAppointment(id) {
  return request(
    `${APPOINTMENTS_URL}/${id}`,
    { method: "DELETE" },
    "Erro ao excluir o compromisso.",
  );
}
