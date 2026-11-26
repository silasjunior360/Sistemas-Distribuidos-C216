import { describe, expect, it } from "vitest";
import {
  formatLongDate,
  formatTime,
  monthDays,
  shiftMonth,
  toISODate,
} from "../../src/utils/calendar";

describe("monthDays", () => {
  it("começa com espaços vazios até o dia da semana do dia 1", () => {
    // 1º de dezembro de 2026 é uma terça: domingo e segunda ficam vazios
    const cells = monthDays(2026, 12);

    expect(cells.slice(0, 3)).toEqual([null, null, 1]);
    expect(cells.at(-1)).toBe(31);
  });

  it("não tem espaço vazio quando o mês começa no domingo", () => {
    // 1º de novembro de 2026 é um domingo
    expect(monthDays(2026, 11)[0]).toBe(1);
  });

  it("conta 29 dias em fevereiro de ano bissexto", () => {
    expect(monthDays(2028, 2).filter(Boolean)).toHaveLength(29);
    expect(monthDays(2027, 2).filter(Boolean)).toHaveLength(28);
  });
});

describe("shiftMonth", () => {
  it("vira o ano entre dezembro e janeiro", () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth(2027, 1, -1)).toEqual({ year: 2026, month: 12 });
  });

  it("anda um mês dentro do mesmo ano", () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2026, month: 12 });
  });
});

it("toISODate completa mês e dia com zero", () => {
  expect(toISODate(2026, 3, 5)).toBe("2026-03-05");
});

it("formatLongDate mostra o dia da semana sem voltar um dia", () => {
  expect(formatLongDate("2026-11-20")).toBe("sexta-feira, 20 de novembro");
});

it("formatTime mostra só horas e minutos", () => {
  expect(formatTime("14:00:00")).toBe("14:00");
});
