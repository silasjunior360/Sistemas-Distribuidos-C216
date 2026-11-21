import { useEffect, useState } from "react";
import { DayAppointments } from "./components/DayAppointments";
import { MonthCalendar } from "./components/MonthCalendar";
import { deleteAppointment, listMonth } from "./services/appointments";
import { shiftMonth, toISODate } from "./utils/calendar";

const today = new Date();

export default function App() {
  // Começa no mês de hoje, com o dia de hoje selecionado
  const [{ year, month }, setVisibleMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  });
  const [selectedDate, setSelectedDate] = useState(
    toISODate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
  );
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");

  // Busca os compromissos sempre que o mês visível muda
  useEffect(() => {
    // Se o usuário trocar de mês antes da resposta chegar, ignora a antiga
    let ignore = false;
    setError("");
    listMonth(year, month)
      .then((data) => {
        if (!ignore) setAppointments(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [year, month]);

  // Ao trocar de mês, seleciona o dia 1 para a lista não mostrar um dia de outro mês
  function changeMonth(delta) {
    const next = shiftMonth(year, month, delta);
    setVisibleMonth(next);
    setSelectedDate(toISODate(next.year, next.month, 1));
  }

  async function handleDelete(id) {
    setError("");
    try {
      await deleteAppointment(id);
      // Tira da lista local: não precisa buscar o mês de novo
      setAppointments((current) => current.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  // A lista do mês já vem ordenada por dia e horário
  const dayAppointments = appointments.filter((a) => a.date === selectedDate);

  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-6 p-4 sm:p-6">
      <h1 className="text-3xl font-bold">Agenda de Compromissos</h1>

      {error && (
        <p role="alert" className="rounded bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      <MonthCalendar
        year={year}
        month={month}
        appointments={appointments}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onChangeMonth={changeMonth}
      />

      <DayAppointments
        date={selectedDate}
        appointments={dayAppointments}
        onDelete={handleDelete}
      />
    </main>
  );
}
