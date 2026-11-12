import { expect, test } from "@playwright/test";

// Sem mocks: usa a API e o banco reais. Nome único para não depender de dados prévios
function uniqueName(prefix) {
  return `${prefix} ${Date.now()}`;
}

test("carrega a interface", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Gerenciador de Itens" }),
  ).toBeVisible();
});

test("mostra erro ao enviar nome vazio", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Adicionar" }).click();

  await expect(page.getByRole("alert")).toHaveText("O nome é obrigatório.");
});

test("cadastra um item e ele persiste após recarregar a página", async ({
  page,
}) => {
  const name = uniqueName("Notebook");
  await page.goto("/");
  await page.getByLabel("Nome").fill(name);
  await page.getByRole("button", { name: "Adicionar" }).click();

  const item = page.getByRole("listitem").filter({ hasText: name });
  await expect(item).toBeVisible();

  await page.reload();
  await expect(item).toBeVisible(); // veio do PostgreSQL
});
