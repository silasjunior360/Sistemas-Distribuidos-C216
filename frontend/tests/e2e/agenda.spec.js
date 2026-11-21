import { expect, test } from "@playwright/test";

// Sem mocks: usa a API e o PostgreSQL reais.
// O App abre no dia de hoje, então os compromissos são criados hoje, cada teste
// num horário diferente (senão um teste daria conflito com o outro). Cada teste
// exclui o que criou, para poder rodar de novo no mesmo banco.

async function createAppointment(page, title, start, end) {
  await page.getByLabel("Título").fill(title);
  await page.getByLabel("Início").fill(start);
  await page.getByLabel("Fim").fill(end);
  await page.getByRole("button", { name: "Salvar" }).click();
}

function dayItem(page, title) {
  return page.getByRole("listitem").filter({ hasText: title });
}

test("cria um compromisso que continua lá depois de recarregar", async ({
  page,
}) => {
  await page.goto("/");

  await createAppointment(page, "Dentista E2E", "08:00", "09:00");
  const item = dayItem(page, "Dentista E2E");
  await expect(item).toContainText("08:00 – 09:00");

  await page.reload();
  await expect(item).toBeVisible(); // veio do PostgreSQL

  await page.getByRole("button", { name: "Excluir Dentista E2E" }).click();
  await expect(item).toHaveCount(0);
  await page.reload();
  await expect(item).toHaveCount(0); // a exclusão também foi salva
});

test("recusa um horário em conflito com outro compromisso", async ({
  page,
}) => {
  await page.goto("/");
  await createAppointment(page, "Reunião E2E", "10:00", "11:00");
  await expect(dayItem(page, "Reunião E2E")).toBeVisible();

  await createAppointment(page, "Almoço E2E", "10:30", "11:30");

  await expect(page.getByRole("alert")).toHaveText(
    "Horário em conflito com 'Reunião E2E' (10:00 às 11:00)",
  );
  await expect(dayItem(page, "Almoço E2E")).toHaveCount(0);

  await page.getByRole("button", { name: "Excluir Reunião E2E" }).click();
  await expect(dayItem(page, "Reunião E2E")).toHaveCount(0);
});

test("recusa término antes do início", async ({ page }) => {
  await page.goto("/");

  await createAppointment(page, "Invertido E2E", "15:00", "14:00");

  await expect(page.getByRole("alert")).toHaveText(
    "O horário de término deve ser depois do início",
  );
});

test("edita um compromisso e a alteração é salva", async ({ page }) => {
  await page.goto("/");
  await createAppointment(page, "Academia E2E", "18:00", "19:00");

  await page.getByRole("button", { name: "Editar Academia E2E" }).click();
  await page.getByLabel("Título").fill("Natação E2E");
  await page.getByLabel("Fim").fill("19:30");
  await page.getByRole("button", { name: "Salvar" }).click();

  const item = dayItem(page, "Natação E2E");
  await expect(item).toContainText("18:00 – 19:30");
  await page.reload();
  await expect(item).toContainText("18:00 – 19:30");
  await expect(dayItem(page, "Academia E2E")).toHaveCount(0);

  await page.getByRole("button", { name: "Excluir Natação E2E" }).click();
  await expect(item).toHaveCount(0);
});
