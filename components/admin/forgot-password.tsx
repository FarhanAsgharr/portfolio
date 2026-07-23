"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Loader2, RotateCcw, ShieldCheck, Smartphone } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { PasswordInput } from "@/components/admin/password-input";
import { PasswordStrength } from "@/components/admin/password-strength";
import { AdminButton, AdminField, AdminInput } from "@/components/admin/ui";
import { isPasswordValid } from "@/lib/password-policy";
import { cn } from "@/lib/utils";

type Step = "phone" | "otp" | "reset" | "done";

const stepTransition = { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const };

/**
 * The forgot-password flow: phone → code → new password → done.
 *
 * One component owns the short-lived state that ties the steps together (the
 * phone entered, the reset token earned by the code step) because that state is
 * meaningless outside the flow and shouldn't outlive it. Each step is a small
 * function below; this parent just decides which one is on screen.
 */
export function ForgotPassword({ onBackToLogin }: { onBackToLogin: () => void }) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        onClick={onBackToLogin}
        className="mb-6 inline-flex items-center gap-2 text-sm text-faint transition-colors hover:text-content"
      >
        <ArrowLeft className="size-4" />
        Back to sign in
      </button>

      {/* Step indicator */}
      <div className="mb-7 flex items-center gap-2">
        {(["phone", "otp", "reset"] as const).map((s, i) => {
          const order = ["phone", "otp", "reset", "done"];
          const reached = order.indexOf(step) >= i;
          return (
            <div key={s} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full font-mono text-[0.625rem] transition-colors duration-300",
                  reached
                    ? "bg-[var(--brand-primary)] text-white"
                    : "border border-line text-faint",
                )}
              >
                {order.indexOf(step) > i || step === "done" ? <Check className="size-3" /> : i + 1}
              </span>
              {i < 2 ? (
                <span
                  className={cn(
                    "h-px flex-1 transition-colors duration-300",
                    order.indexOf(step) > i ? "bg-[var(--brand-primary)]" : "bg-line",
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={stepTransition}
        >
          {step === "phone" ? (
            <PhoneStep
              phone={phone}
              setPhone={setPhone}
              onSent={(masked) => {
                setMaskedPhone(masked);
                setStep("otp");
              }}
            />
          ) : null}

          {step === "otp" ? (
            <OtpStep
              phone={phone}
              maskedPhone={maskedPhone}
              onVerified={(token) => {
                setResetToken(token);
                setStep("reset");
              }}
              onResend={() => {
                /* handled inside via its own request */
              }}
            />
          ) : null}

          {step === "reset" ? (
            <ResetStep resetToken={resetToken} onDone={() => setStep("done")} />
          ) : null}

          {step === "done" ? <DoneStep onBackToLogin={onBackToLogin} /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 1 — phone                                                            */
/* -------------------------------------------------------------------------- */

function PhoneStep({
  phone,
  setPhone,
  onSent,
}: {
  phone: string;
  setPhone: (v: string) => void;
  onSent: (maskedPhone: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setDevCode(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = (await res.json()) as {
        error?: string;
        maskedPhone?: string;
        devCode?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Couldn't send a code.");

      // Dev delivery (no SMS provider) hands the code back; carry it into the
      // next step so testing doesn't need a phone.
      if (data.devCode) {
        setDevCode(data.devCode);
        // Brief pause so the tester can read the code before the step slides.
        setTimeout(() => onSent(data.maskedPhone ?? null), 1200);
        return;
      }

      onSent(data.maskedPhone ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send a code.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div>
        <span className="grid size-11 place-items-center rounded-xl border border-line bg-[var(--surface-inset)] text-primary">
          <Smartphone className="size-5" />
        </span>
        <h1 className="mt-5 text-h3">Reset your password</h1>
        <p className="mt-2 text-sm text-muted">
          Enter your registered phone number and we&apos;ll text you a 6-digit code.
        </p>
      </div>

      <AdminField label="Phone number" htmlFor="phone" hint="Include the country code, e.g. +92…">
        <AdminInput
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          autoFocus
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+92 300 0000000"
          aria-invalid={Boolean(error)}
        />
      </AdminField>

      {error ? (
        <p role="alert" className="text-sm text-[#e0685e]">
          {error}
        </p>
      ) : null}

      {devCode ? (
        <p className="rounded-lg border border-[color-mix(in_oklab,var(--brand-accent)_30%,transparent)] bg-[color-mix(in_oklab,var(--brand-accent)_10%,transparent)] px-4 py-3 text-sm text-content">
          Test mode — your code is{" "}
          <strong className="font-mono tracking-widest">{devCode}</strong>
        </p>
      ) : null}

      <AdminButton type="submit" tone="primary" disabled={busy || phone.trim().length < 6}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : null}
        {busy ? "Sending…" : "Send code"}
      </AdminButton>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 2 — OTP                                                              */
/* -------------------------------------------------------------------------- */

const OTP_LENGTH = 6;
const COUNTDOWN_START = 5 * 60; // 5 minutes, matching the server TTL

function OtpStep({
  phone,
  maskedPhone,
  onVerified,
}: {
  phone: string;
  maskedPhone: string | null;
  onVerified: (resetToken: string) => void;
  onResend: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_START);
  const [resending, setResending] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  // Countdown to expiry; drives the "Resend" button becoming available.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const submit = useCallback(
    async (fullCode: string) => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, code: fullCode }),
        });
        const data = (await res.json()) as { error?: string; resetToken?: string };
        if (!res.ok || !data.resetToken) throw new Error(data.error ?? "Verification failed.");
        onVerified(data.resetToken);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Verification failed.");
        setDigits(Array(OTP_LENGTH).fill(""));
        inputs.current[0]?.focus();
        setBusy(false);
      }
    },
    [phone, onVerified],
  );

  function maybeAutoSubmit(next: string[]) {
    // Submit the moment the sixth digit lands, rather than watching `code` from
    // an effect — driving it off the interaction avoids a setState-in-effect
    // cascade and reads more directly.
    const full = next.join("");
    if (full.length === OTP_LENGTH && !busy) void submit(full);
  }

  function setDigit(index: number, value: string) {
    const char = value.replace(/\D/g, "").slice(-1);
    let updated: string[] = digits;
    setDigits((prev) => {
      const next = [...prev];
      next[index] = char;
      updated = next;
      return next;
    });
    if (char && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
    if (char) maybeAutoSubmit(updated);
  }

  function onKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function onPaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((d, i) => (next[i] = d));
    setDigits(next);
    inputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    maybeAutoSubmit(next);
  }

  async function resend() {
    setResending(true);
    setError(null);
    setDevCode(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = (await res.json()) as { error?: string; devCode?: string };
      if (!res.ok) throw new Error(data.error ?? "Couldn't resend.");
      if (data.devCode) setDevCode(data.devCode);
      setDigits(Array(OTP_LENGTH).fill(""));
      setSecondsLeft(COUNTDOWN_START);
      inputs.current[0]?.focus();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't resend.");
    } finally {
      setResending(false);
    }
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const expired = secondsLeft <= 0;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="grid size-11 place-items-center rounded-xl border border-line bg-[var(--surface-inset)] text-primary">
          <ShieldCheck className="size-5" />
        </span>
        <h1 className="mt-5 text-h3">Enter the code</h1>
        <p className="mt-2 text-sm text-muted">
          We sent a 6-digit code to {maskedPhone ?? "your phone"}.
        </p>
      </div>

      <div className="flex justify-between gap-2" onPaste={onPaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            autoFocus={i === 0}
            value={digit}
            disabled={busy}
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            className={cn(
              "h-13 w-full rounded-xl border bg-[var(--surface-inset)]/60 text-center font-mono text-xl text-content",
              "transition-[border-color,box-shadow] duration-200 focus:outline-none",
              error
                ? "border-[color-mix(in_oklab,#e0685e_50%,transparent)]"
                : "border-line focus:border-[color-mix(in_oklab,var(--brand-primary)_60%,transparent)] focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--brand-primary)_14%,transparent)]",
            )}
          />
        ))}
      </div>

      {busy ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="size-4 animate-spin" />
          Verifying…
        </p>
      ) : error ? (
        <p role="alert" className="text-sm text-[#e0685e]">
          {error}
        </p>
      ) : null}

      {devCode ? (
        <p className="rounded-lg border border-[color-mix(in_oklab,var(--brand-accent)_30%,transparent)] bg-[color-mix(in_oklab,var(--brand-accent)_10%,transparent)] px-4 py-3 text-sm text-content">
          Test mode — new code is{" "}
          <strong className="font-mono tracking-widest">{devCode}</strong>
        </p>
      ) : null}

      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-faint tabular-nums">
          {expired ? "Code expired" : `Expires in ${mm}:${ss}`}
        </span>

        <button
          type="button"
          onClick={resend}
          disabled={!expired || resending}
          className={cn(
            "inline-flex items-center gap-1.5 text-sm transition-colors",
            expired && !resending
              ? "text-primary hover:underline"
              : "cursor-not-allowed text-faint",
          )}
        >
          {resending ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
          Resend code
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 3 — reset                                                            */
/* -------------------------------------------------------------------------- */

function ResetStep({ resetToken, onDone }: { resetToken: string; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strong = isPasswordValid(password);
  const match = confirm.length > 0 && password === confirm;
  const canSubmit = strong && match && !busy;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword: password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Couldn't reset the password.");
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't reset the password.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div>
        <h1 className="text-h3">Set a new password</h1>
        <p className="mt-2 text-sm text-muted">Choose something you haven&apos;t used here before.</p>
      </div>

      <AdminField label="New password" htmlFor="new-password">
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
        />
      </AdminField>

      <PasswordStrength password={password} />

      <AdminField label="Confirm password" htmlFor="confirm-password">
        <PasswordInput
          id="confirm-password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Type it again"
          aria-invalid={confirm.length > 0 && !match}
        />
        {confirm.length > 0 && !match ? (
          <p className="text-xs text-[#e0685e]">The two passwords don&apos;t match.</p>
        ) : null}
      </AdminField>

      {error ? (
        <p role="alert" className="text-sm text-[#e0685e]">
          {error}
        </p>
      ) : null}

      <AdminButton type="submit" tone="primary" disabled={!canSubmit}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : null}
        {busy ? "Saving…" : "Reset password"}
      </AdminButton>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 4 — done                                                            */
/* -------------------------------------------------------------------------- */

function DoneStep({ onBackToLogin }: { onBackToLogin: () => void }) {
  // Send them back to sign in automatically — the reset already invalidated the
  // old session, so there's nothing to stay on this screen for.
  useEffect(() => {
    const t = setTimeout(onBackToLogin, 2600);
    return () => clearTimeout(t);
  }, [onBackToLogin]);

  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="grid size-14 place-items-center rounded-full bg-[color-mix(in_oklab,#2e9e7e_20%,transparent)] text-[#54c79f]"
      >
        <Check className="size-7" />
      </motion.span>
      <div>
        <h1 className="text-h3">Password changed successfully</h1>
        <p className="mt-2 text-sm text-muted">Taking you back to sign in…</p>
      </div>
      <AdminButton onClick={onBackToLogin} tone="primary">
        Sign in now
      </AdminButton>
    </div>
  );
}
