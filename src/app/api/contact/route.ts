import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { name, email, message } = await request.json();

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "Mensagem é obrigatória." }, { status: 400 });
  }

  const token = process.env.PUSHOVER_TOKEN;
  const user = process.env.PUSHOVER_USER;

  if (!token || !user) {
    console.error("Pushover credentials not configured");
    return NextResponse.json({ error: "Serviço indisponível." }, { status: 500 });
  }

  const lines = [
    "Contato — Derivativos Lab",
    name ? `Nome: ${name}` : null,
    email ? `Email: ${email}` : null,
    "",
    message.trim(),
  ]
    .filter(Boolean)
    .join("\n");

  const body = new URLSearchParams({
    token,
    user,
    title: "Derivativos Lab — Contato",
    message: lines,
  });

  const res = await fetch("https://api.pushover.net/1/messages.json", {
    method: "POST",
    body,
  });

  if (!res.ok) {
    console.error("Pushover error:", await res.text());
    return NextResponse.json({ error: "Falha ao enviar mensagem." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
