import { describe, expect, it } from "vitest";
import {
  LEAD_LIMITS,
  cleanText,
  createLeadPayload,
  declaredBodyTooLarge,
  normalizeFormType,
  validateLead,
} from "../src/lib/leads";

function validForm(type = "general") {
  const form = new FormData();
  form.set("form_type", type);
  form.set("full_name", "  Sana   Example  ");
  form.set("email", "SANA@example.com");
  form.set("phone", "0416 977 990");
  form.set("consent", "yes");
  return form;
}

describe("lead normalization", () => {
  it("collapses whitespace and respects max length", () => {
    expect(cleanText("  A   B  ", 10)).toBe("A B");
    expect(cleanText("123456", 4)).toBe("1234");
  });

  it("allows only known form types", () => {
    expect(normalizeFormType("rental_appraisal")).toBe("rental_appraisal");
    expect(normalizeFormType("switch_manager")).toBe("switch_manager");
    expect(normalizeFormType("anything_else")).toBe("general");
  });

  it("normalizes email casing and text before delivery", () => {
    const lead = createLeadPayload(validForm(), {
      id: "lead-1",
      submittedAt: "2026-08-27T00:00:00.000Z",
    });
    expect(lead.fullName).toBe("Sana Example");
    expect(lead.email).toBe("sana@example.com");
  });
});

describe("lead validation", () => {
  it("accepts a valid general enquiry without a property location", () => {
    const lead = createLeadPayload(validForm(), {
      id: "lead-1",
      submittedAt: "2026-08-27T00:00:00.000Z",
    });
    expect(validateLead(lead)).toEqual([]);
  });

  it("requires a property location for appraisal and switching journeys", () => {
    for (const type of ["rental_appraisal", "switch_manager"]) {
      const lead = createLeadPayload(validForm(type), {
        id: "lead-1",
        submittedAt: "2026-08-27T00:00:00.000Z",
      });
      expect(validateLead(lead)).toContain("property_location");
    }
  });

  it("accepts suburb alone as sufficient initial property context", () => {
    const form = validForm("rental_appraisal");
    form.set("suburb", "Port Melbourne");
    const lead = createLeadPayload(form, {
      id: "lead-1",
      submittedAt: "2026-08-27T00:00:00.000Z",
    });
    expect(validateLead(lead)).not.toContain("property_location");
  });

  it("rejects malformed contact data and missing consent", () => {
    const form = validForm();
    form.set("full_name", "A");
    form.set("email", "not-an-email");
    form.set("phone", "12");
    form.delete("consent");
    const errors = validateLead(
      createLeadPayload(form, {
        id: "lead-1",
        submittedAt: "2026-08-27T00:00:00.000Z",
      }),
    );
    expect(errors).toEqual(
      expect.arrayContaining(["full_name", "email", "phone", "consent"]),
    );
  });
});

describe("request limits", () => {
  it("rejects declared bodies over the lead endpoint limit", () => {
    expect(declaredBodyTooLarge(String(LEAD_LIMITS.requestBytes + 1))).toBe(
      true,
    );
    expect(declaredBodyTooLarge(String(LEAD_LIMITS.requestBytes))).toBe(false);
    expect(declaredBodyTooLarge(null)).toBe(false);
  });
});
