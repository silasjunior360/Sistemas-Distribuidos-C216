import { monthDays, toISODate } from "../utils/calendar";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Grade do mês. Só desenha: quem guarda o mês e o dia escolhido é o App.
export function MonthCalendar({
  year,
  month,
  appointments,
  selectedDate,
  onSelectDate,
  onChangeMonth,
}) {
  // "novembro de 2026"
  const title = new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  // monthDays devolve null nos espaços antes do dia 1, depois os dias
  const cells = monthDays(year, month);
  const blanks = cells.filter((day) => day === null).length;
  const days = cells.slice(blanks);

  // Quantos compromissos cada dia tem, para marcar na grade
  const counts = {};
  for (const appointment of appointments) {
    counts[appointment.date] = (counts[appointment.date] ?? 0) + 1;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onChangeMonth(-1)}
          aria-label="Mês anterior"
          className="rounded px-3 py-1 text-xl hover:bg-slate-100"
        >
          ‹
        </button>
        <h2 className="text-lg font-semibold first-letter:uppercase">
          {title}
        </h2>
        <button
          type="button"
          onClick={() => onChangeMonth(1)}
          aria-label="Próximo mês"
          className="rounded px-3 py-1 text-xl hover:bg-slate-100"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="text-xs font-medium text-slate-500">
            {weekday}
          </div>
        ))}

        {/* Um só espaço ocupando as colunas antes do dia 1 */}
        {blanks > 0 && <div style={{ gridColumn: `span ${blanks}` }} />}

        {days.map((day) => {
          const date = toISODate(year, month, day);
          const count = counts[date] ?? 0;
          const selected = date === selectedDate;
          const label =
            count > 0
              ? `${day}, ${count} compromisso${count > 1 ? "s" : ""}`
              : String(day);

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              aria-label={label}
              aria-pressed={selected}
              className={`flex h-12 flex-col items-center justify-center rounded ${
                selected ? "bg-blue-600 text-white" : "hover:bg-slate-100"
              }`}
            >
              {day}
              {count > 0 && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    selected ? "bg-white" : "bg-blue-600"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
