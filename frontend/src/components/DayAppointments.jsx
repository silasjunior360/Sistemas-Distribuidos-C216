import { formatLongDate, formatTime } from "../utils/calendar";

// Compromissos do dia escolhido, já em ordem de horário (a API ordena)
export function DayAppointments({ date, appointments, onEdit, onDelete }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold first-letter:uppercase">
        {formatLongDate(date)}
      </h2>

      {appointments.length === 0 ? (
        <p className="text-slate-600">Nenhum compromisso neste dia.</p>
      ) : (
        <ul className="space-y-2">
          {appointments.map((appointment) => (
            <li
              key={appointment.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-blue-700">
                  {formatTime(appointment.start_time)} –{" "}
                  {formatTime(appointment.end_time)}
                </p>
                <p className="font-medium">{appointment.title}</p>
                {appointment.description && (
                  <p className="text-sm text-slate-600">
                    {appointment.description}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onEdit(appointment)}
                  aria-label={`Editar ${appointment.title}`}
                  className="text-sm text-blue-700 hover:underline"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(appointment.id)}
                  aria-label={`Excluir ${appointment.title}`}
                  className="text-sm text-red-600 hover:underline"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
