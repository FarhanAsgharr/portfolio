import { z } from "zod";

/**
 * Contact form contract.
 *
 * Shared by the client form and the API route, so the browser and the server
 * agree on what a valid message is by construction rather than by convention.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(80, "That's longer than 80 characters."),
  email: z.email("That doesn't look like an email address.").max(200),
  subject: z
    .string()
    .trim()
    .min(3, "Give the message a subject.")
    .max(120, "Keep the subject under 120 characters."),
  message: z
    .string()
    .trim()
    .min(20, "Tell me a bit more — at least 20 characters.")
    .max(4000, "Keep it under 4,000 characters."),
  /**
   * Honeypot. Real people never see this field, so anything in it is a bot.
   * Cheaper and less hostile than a captcha.
   *
   * Deliberately permissive: rejecting a non-empty value here would return a
   * validation error naming the field, which tells a bot exactly what the trap
   * is — and would show a real person an inexplicable error if their browser
   * autofilled it. The route accepts these silently instead.
   */
  company: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
