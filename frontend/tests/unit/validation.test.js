import { describe, expect, it } from "vitest";
import { NAME_MAX_LENGTH, validateItem } from "../../src/validation";

describe("validateItem", () => {
  it("rejeita nome vazio ou só com espaços", () => {
    const { errors } = validateItem({ name: "   ", description: "" });
    expect(errors.name).toBeDefined();
  });

  it("rejeita nome maior que o limite", () => {
    const { errors } = validateItem({
      name: "a".repeat(NAME_MAX_LENGTH + 1),
      description: "",
    });
    expect(errors.name).toBeDefined();
  });

  it("aceita item válido e remove espaços", () => {
    const { errors, values } = validateItem({
      name: "  Notebook ",
      description: " 14 ",
    });
    expect(errors).toEqual({});
    expect(values).toEqual({ name: "Notebook", description: "14" });
  });
});
