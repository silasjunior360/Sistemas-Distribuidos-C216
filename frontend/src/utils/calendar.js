// Contas do calendário, sem React: fáceis de testar sozinhas.
// O mês vai de 1 a 12, como na API (o Date do JavaScript usa 0 a 11).

// Células da grade do mês: null nos espaços antes do dia 1, depois os dias.
// A semana começa no domingo, então o dia 1 cai na coluna do seu dia da semana.
export function monthDays(year, month) {
  const firstWeekday = new Date(year, month - 1, 1).getDay(); // 0 = domingo
  // Dia 0 do mês seguinte é o último dia deste mês
  const totalDays = new Date(year, month, 0).getDate();
  const blanks = Array(firstWeekday).fill(null);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  return [...blanks, ...days];
}

// Mês anterior (-1) ou seguinte (+1), virando o ano quando precisa
export function shiftMonth(year, month, delta) {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

// Data no formato da API: 2026-11-05
export function toISODate(year, month, day) {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

// "2026-11-20" -> "sexta-feira, 20 de novembro"
export function formatLongDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  // new Date("2026-11-20") seria meia-noite em UTC, que no Brasil ainda é dia 19
  return new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// A API devolve "14:00:00"; na tela mostramos só "14:00"
export function formatTime(time) {
  return time.slice(0, 5);
}
