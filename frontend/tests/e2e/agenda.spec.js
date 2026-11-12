import { expect, test } from "@playwright/test";

// Sem mocks: roda contra a stack real (frontend + API + banco)
test("carrega a interface", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Agenda de Compromissos" }),
  ).toBeVisible();
});
