"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Loader2, MapPin, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { contactSchema, type ContactInput } from "@/lib/validation";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Contact.
 *
 * Form on the left, the direct routes on the right — some people would rather
 * email than fill anything in, and pretending otherwise costs conversations.
 */
export function Contact() {
  const { profile, socials } = useContent();
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const { copied, copy } = useCopyToClipboard();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
  });

  async function onSubmit(values: ContactInput) {
    setStatus("sending");
    setServerError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "The message couldn't be sent.");
      }

      setStatus("sent");
      reset();
    } catch (error) {
      setStatus("error");
      setServerError(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <Section id="contact">
      <SectionHeading
        node="contact"
        title="Tell me what you're building"
        description="The more specific you are about the problem, the more useful my first reply will be. I answer everything within two working days."
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* ------------------------------------------------------------- */}
        {/*  Form                                                          */}
        {/* ------------------------------------------------------------- */}
        <Reveal>
          <Card spotlight={false} className="h-full p-6 sm:p-9">
            <AnimatePresence mode="wait">
              {status === "sent" ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex min-h-[28rem] flex-col items-center justify-center text-center"
                >
                  <span className="grid size-14 place-items-center rounded-full border border-[color-mix(in_oklab,var(--brand-secondary)_40%,transparent)] bg-[color-mix(in_oklab,var(--brand-secondary)_12%,transparent)] text-[var(--brand-secondary)]">
                    <Check className="size-6" />
                  </span>
                  <h3 className="mt-6 text-h3">Message sent</h3>
                  <p className="mt-3 max-w-sm text-muted">
                    Thanks — it landed. You&apos;ll hear back from {profile.email} within two
                    working days.
                  </p>
                  <Button
                    variant="ghost"
                    className="mt-6"
                    onClick={() => setStatus("idle")}
                  >
                    Send another
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="flex flex-col gap-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="name" label="Your name" error={errors.name?.message}>
                      <Input
                        id="name"
                        placeholder="Ada Lovelace"
                        autoComplete="name"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? "name-error" : undefined}
                        {...register("name")}
                      />
                    </Field>

                    <Field id="email" label="Email" error={errors.email?.message}>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ada@company.com"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        {...register("email")}
                      />
                    </Field>
                  </div>

                  <Field id="subject" label="Subject" error={errors.subject?.message}>
                    <Input
                      id="subject"
                      placeholder="RAG pipeline for a 200k-document corpus"
                      aria-invalid={Boolean(errors.subject)}
                      aria-describedby={errors.subject ? "subject-error" : undefined}
                      {...register("subject")}
                    />
                  </Field>

                  <Field
                    id="message"
                    label="Message"
                    error={errors.message?.message}
                    hint="What are you building, what's the constraint, and when does it need to exist?"
                  >
                    <Textarea
                      id="message"
                      placeholder="We have 200k support documents and answers that cite the wrong policy…"
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={
                        errors.message ? "message-error" : "message-hint"
                      }
                      {...register("message")}
                    />
                  </Field>

                  {/* Honeypot — hidden from people, irresistible to bots. */}
                  <div aria-hidden className="absolute -left-[9999px]">
                    <label htmlFor="company">Company</label>
                    <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
                  </div>

                  {status === "error" && serverError ? (
                    <p role="alert" className="text-sm text-[#f87171]">
                      {serverError} You can also email{" "}
                      <a
                        href={`mailto:${profile.email}`}
                        className="underline underline-offset-4"
                      >
                        {profile.email}
                      </a>
                      .
                    </p>
                  ) : null}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={status === "sending"}
                    className="mt-1 self-start"
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Sending
                      </>
                    ) : (
                      <>
                        <Send />
                        Send message
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </Card>
        </Reveal>

        {/* ------------------------------------------------------------- */}
        {/*  Direct routes                                                 */}
        {/* ------------------------------------------------------------- */}
        <Reveal delay={0.08} className="flex flex-col gap-5">
          <Card spotlight={false} className="p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--brand-accent)] opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-[var(--brand-accent)]" />
              </span>
              <p className="font-mono text-eyebrow text-faint uppercase">Availability</p>
            </div>

            <p className="mt-4 text-lead text-content">{profile.availability.label}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {profile.availability.detail}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1.5">
                <MapPin className="size-3" />
                {profile.location}
              </Badge>
              <Badge variant="outline">{profile.timezone}</Badge>
            </div>
          </Card>

          <Card spotlight={false} className="p-6 sm:p-8">
            <p className="font-mono text-eyebrow text-faint uppercase">Direct</p>

            <button
              type="button"
              onClick={() => copy(profile.email)}
              className="group mt-4 flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-[var(--surface-inset)]/50 px-4 py-3.5 text-left transition-colors duration-300 hover:border-line-strong"
            >
              <span className="truncate font-mono text-sm text-content">{profile.email}</span>
              {copied ? (
                <Check className="size-4 shrink-0 text-[var(--brand-secondary)]" />
              ) : (
                <Copy className="size-4 shrink-0 text-faint transition-colors group-hover:text-content" />
              )}
              <span className="sr-only">{copied ? "Email copied" : "Copy email address"}</span>
            </button>

            <ul className="mt-5 grid grid-cols-2 gap-2">
              {socials.map((social) => (
                <li key={social.label}>
                  <Link
                    href={social.href}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-lg border border-line px-3.5 py-3 text-sm text-muted transition-colors duration-300 hover:border-line-strong hover:text-content"
                  >
                    <Icon name={social.icon} className="size-4 shrink-0" />
                    <span className="truncate">{social.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}
