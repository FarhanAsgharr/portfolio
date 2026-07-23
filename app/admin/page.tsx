import { AdminEditor } from "@/components/admin/editor";
import { getContentForEditing } from "@/lib/content";
import { isDatabaseConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * The editor is reached only through `middleware.ts`, which verifies the
 * session before this renders. Content is read fresh — an admin panel showing
 * a cached copy of what you just changed would be worse than useless.
 */
export default async function AdminPage() {
  const content = await getContentForEditing();

  return <AdminEditor initialContent={content} databaseConfigured={isDatabaseConfigured()} />;
}
