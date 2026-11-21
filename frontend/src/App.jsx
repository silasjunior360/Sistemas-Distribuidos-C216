import { useEffect, useState } from "react";
import { AppointmentForm } from "./components/AppointmentForm";
import { DayAppointments } from "./components/DayAppointments";
import { MonthCalendar } from "./components/MonthCalendar";
import {
  createAppointment,
  deleteAppointment,
  listMonth,
  updateAppointment,
} from "./services/appointments";
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
  // Compromisso aberto no formulário para edição (null = criando um novo)
  const [editing, setEditing] = useState(null);
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
      if (editing?.id === id) setEditing(null);
    } catch (err) {
      setError(err.message);
    }
  }

  // Chamado pelo formulário. Se a API recusar (409, 422), o erro sobe
  // para o formulário, que mostra a mensagem.
  async function handleSave(data) {
    const saved = editing
      ? await updateAppointment(editing.id, data)
      : await createAppointment(data);
    setEditing(null);
    setSelectedDate(saved.date);

    // Mostra o mês do compromisso salvo, com a lista atualizada
    const [savedYear, savedMonth] = saved.date.split("-").map(Number);
    if (savedYear === year && savedMonth === month) {
      setAppointments(await listMonth(year, month));
    } else {
      setVisibleMonth({ year: savedYear, month: savedMonth }); // o useEffect busca
    }
  }

  // A lista do mês já vem ordenada por dia e horário
  const dayAppointments = appointments.filter((a) => a.date === selectedDate);

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 p-4 sm:p-6">
      <h1 className="text-3xl font-bold">Agenda de Compromissos</h1>

      {error && (
        <p role="alert" className="rounded bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      {/* Calendário à esquerda; dia e formulário à direita (empilha no celular) */}
      <div className="grid gap-6 md:grid-cols-2">
        <MonthCalendar
          year={year}
          month={month}
          appointments={appointments}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onChangeMonth={changeMonth}
        />

        <div className="space-y-6">
          <DayAppointments
            date={selectedDate}
            appointments={dayAppointments}
            onEdit={setEditing}
            onDelete={handleDelete}
          />

          {/* A key recria o formulário (zerando os campos) ao trocar de dia
              ou de compromisso em edição */}
          <AppointmentForm
            key={editing ? `editar-${editing.id}` : `novo-${selectedDate}`}
            appointment={editing}
            defaultDate={selectedDate}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
          />
        </div>
      </div>
    </main>
  );
}
