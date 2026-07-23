/**
 * The password rules, in one place so the client meter and the server check can
 * never disagree. No "server-only" marker: this is pure logic and is imported
 * by the browser strength indicator as well as the reset route.
 */

export interface PolicyCheck {
  label: string;
  passed: boolean;
}

export interface PasswordAssessment {
  checks: PolicyCheck[];
  /** True only when every rule passes. */
  valid: boolean;
  /** 0–4, for the strength bar. Distinct from validity: length adds strength. */
  score: number;
  /** "Weak" | "Fair" | "Good" | "Strong". */
  label: string;
}

const RULES: Array<{ label: string; test: (p: string) => boolean }> = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /\d/.test(p) },
  { label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function assessPassword(password: string): PasswordAssessment {
  const checks = RULES.map((rule) => ({ label: rule.label, passed: rule.test(password) }));
  const passed = checks.filter((c) => c.passed).length;
  const valid = passed === RULES.length;

  // Strength ≠ validity: a 20-character password that meets every rule should
  // read as stronger than a bare-minimum 8-character one that also passes.
  let score = Math.min(4, Math.max(0, passed - 1));
  if (valid && password.length >= 12) score = 4;
  if (valid && password.length >= 16) score = 4;

  const label = ["Very weak", "Weak", "Fair", "Good", "Strong"][score] ?? "Weak";

  return { checks, valid, score, label };
}

/** The single source of truth for "is this password acceptable". */
export function isPasswordValid(password: string): boolean {
  return assessPassword(password).valid;
}
