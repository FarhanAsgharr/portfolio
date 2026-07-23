import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminEditor } from "@/components/admin/editor";
import { verifyActiveSession } from "@/lib/admin-auth";
import { SESSION_COOKIE } from "@/lib/auth";
import { getContentForEditing } from "@/lib/content";
import { isDatabaseConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * The editor.
 *
 * The proxy middleware gates this path, but that check is Edge-safe and can only
 * confirm a token's signature and expiry — not that its version is still
 * current. So the full check runs here too: a session minted before a password
 * reset is bounced to the login screen rather than being shown a shell it can no
 * longer act through.
 */
export default async function AdminPage() {
  const store = await cookies();
  if (!(await verifyActiveSession(store.get(SESSION_COOKIE)?.value))) {
    redirect("/admin/login");
  }

  const content = await getContentForEditing();

  return <AdminEditor initialContent={content} databaseConfigured={isDatabaseConfigured()} />;
}
