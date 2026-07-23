import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { SESSION_COOKIE, isAuthConfigured, verifySessionToken } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const store = await cookies();
  if (await verifySessionToken(store.get(SESSION_COOKIE)?.value)) {
    redirect("/admin");
  }

  const { next } = await searchParams;

  return (
    <LoginForm
      next={next}
      authConfigured={isAuthConfigured()}
      databaseConfigured={isDatabaseConfigured()}
    />
  );
}
