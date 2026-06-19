"use server";

import { sql } from "@/lib/db";
import { ensureApplicationsTable } from "@/lib/applications";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_SOURCES = new Set([
  "global-networking",
  "social-wellness",
  "market-intelligence",
  "direct",
]);

/**
 * Answers collected through the "Hero Journey" ski-game (see /apply).
 * Field ids match the QUESTIONS list in the game controller.
 */
export type ApplicationInput = {
  identity: string;
  conflict: string;
  solution: string;
  path: string;
  leader: string;
  teach: string;
  email: string;
  links: string;
  source: string;
};

export type SubmitResult =
  | { ok: true; message: string }
  | { ok: false; message: string; field?: keyof ApplicationInput };

function clean(value: unknown, max = 4000): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export async function submitApplication(input: ApplicationInput): Promise<SubmitResult> {
  const identity = clean(input.identity, 200);
  const conflict = clean(input.conflict, 4000);
  const solution = clean(input.solution, 4000);
  const path = clean(input.path, 4000);
  const leader = clean(input.leader, 4000);
  const teach = clean(input.teach, 4000);
  const email = clean(input.email, 200).toLowerCase();
  const links = clean(input.links, 500);
  const rawSource = clean(input.source, 60);
  const source = ALLOWED_SOURCES.has(rawSource) ? rawSource : "direct";

  if (!identity) {
    return { ok: false, message: "Tell us what you call yourself.", field: "identity" };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Please enter a valid email address.", field: "email" };
  }

  await ensureApplicationsTable();

  try {
    await sql`
      INSERT INTO oliver_club_applications
        (identity, conflict, solution, path, leader, teach, email, links, source)
      VALUES
        (${identity}, ${conflict || null}, ${solution || null}, ${path || null},
         ${leader || null}, ${teach || null}, ${email}, ${links || null}, ${source})
    `;
    return { ok: true, message: "Thanks — we've received your application." };
  } catch (err) {
    console.error("application submit error", err);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}
