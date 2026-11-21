import { useEffect, useState } from "react";
import { MonthCalendar } from "./components/MonthCalendar";
import { listMonth } from "./services/appointments";
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
        onChangeMonth={(delta) =>
          setVisibleMonth(shiftMonth(year, month, delta))
        }
      />
    </main>
  );
}
