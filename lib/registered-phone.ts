import "server-only";

import { getContent } from "@/lib/content";

/**
 * The one number a password-reset code may be sent to.
 *
 * Fixed by the owner, never chosen by the requester: `ADMIN_PHONE` if set,
 * otherwise the phone in the site content (the Contact tab). Returns null when
 * neither exists, in which case the reset flow declines rather than texting an
 * arbitrary number.
 */
export async function getRegisteredPhone(): Promise<string | null> {
  if (process.env.ADMIN_PHONE) return process.env.ADMIN_PHONE;
  try {
    const content = await getContent();
    return content.profile.phone ?? null;
  } catch {
    return null;
  }
}
