import { useState } from "react";
import { formatTime } from "../utils/calendar";

// Valores iniciais: os do compromisso em edição, ou vazios com a data escolhida
function initialValues(appointment, defaultDate) {
  if (appointment) {
    return {
      title: appointment.title,
      description: appointment.description ?? "",
      date: appointment.date,
      start_time: formatTime(appointment.start_time),
      end_time: formatTime(appointment.end_time),
    };
  }
  return {
    title: "",
    description: "",
    date: defaultDate,
    start_time: "",
    end_time: "",
  };
}

const INPUT_CLASS =
  "mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal";

// Formulário de criar e editar. Quem chama a API é o App (onSubmit);
// se ele lançar erro (409, 422...), a mensagem aparece aqui no formulário.
export function AppointmentForm({
  appointment,
  defaultDate,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(() =>
    initialValues(appointment, defaultDate),
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const editing = Boolean(appointment);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit(values);
      // Depois de criar, limpa para o próximo (na edição o App fecha o formulário)
      if (!editing) {
        setValues(initialValues(null, defaultDate));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-lg font-semibold">
        {editing ? "Editar compromisso" : "Novo compromisso"}
      </h2>

      <label className="block text-sm font-medium">
        Título
        <input
          name="title"
          value={values.title}
          onChange={handleChange}
          required
          maxLength={100}
          className={INPUT_CLASS}
        />
      </label>

      <label className="block text-sm font-medium">
        Descrição
        <textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          rows={2}
          className={INPUT_CLASS}
        />
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="block text-sm font-medium">
          Data
          <input
            type="date"
            name="date"
            value={values.date}
            onChange={handleChange}
            required
            className={INPUT_CLASS}
          />
        </label>
        <label className="block text-sm font-medium">
          Início
          <input
            type="time"
            name="start_time"
            value={values.start_time}
            onChange={handleChange}
            required
            className={INPUT_CLASS}
          />
        </label>
        <label className="block text-sm font-medium">
          Fim
          <input
            type="time"
            name="end_time"
            value={values.end_time}
            onChange={handleChange}
            required
            className={INPUT_CLASS}
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded px-4 py-2 hover:bg-slate-100"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
