import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyActiveSession } from "@/lib/admin-auth";
import { SESSION_COOKIE } from "@/lib/auth";
import { deleteMessage, listMessages, setRead } from "@/lib/contact-store";

/** Contact-form inbox: list, mark read/unread, delete. */

async function authed() {
  const store = await cookies();
  return verifyActiveSession(store.get(SESSION_COOKIE)?.value);
}

export async function GET() {
  if (!(await authed())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  return NextResponse.json({ messages: await listMessages() });
}

export async function PATCH(request: Request) {
  if (!(await authed())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { id?: unknown; read?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const id = Number(body.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Bad id." }, { status: 400 });

  await setRead(id, Boolean(body.read));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await authed())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Bad id." }, { status: 400 });

  await deleteMessage(id);
  return NextResponse.json({ ok: true });
}
