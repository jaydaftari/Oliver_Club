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

export type ApplicationInput = {
  name: string;
  email: string;
  phone: string;
  city: string;
  companyTitle: string;
  socialMedias: string;
  source: string;
};

export type SubmitResult =
  | { ok: true; message: string }
  | { ok: false; message: string; field?: keyof ApplicationInput };

function clean(value: unknown, max = 500): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export async function submitApplication(input: ApplicationInput): Promise<SubmitResult> {
  const name = clean(input.name, 200);
  const email = clean(input.email, 200).toLowerCase();
  const phone = clean(input.phone, 60);
  const city = clean(input.city, 120);
  const companyTitle = clean(input.companyTitle, 240);
  const socialMedias = clean(input.socialMedias, 500);
  const rawSource = clean(input.source, 60);
  const source = ALLOWED_SOURCES.has(rawSource) ? rawSource : "direct";

  if (!name) {
    return { ok: false, message: "Please enter your name.", field: "name" };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Please enter a valid email address.", field: "email" };
  }
  if (!companyTitle) {
    return {
      ok: false,
      message: "Please share your company or title.",
      field: "companyTitle",
    };
  }

  await ensureApplicationsTable();

  try {
    await sql`
      INSERT INTO oliver_club_applications
        (name, email, phone, city, company_title, social_medias, source)
      VALUES
        (${name}, ${email}, ${phone || null}, ${city || null},
         ${companyTitle}, ${socialMedias || null}, ${source})
    `;
    return { ok: true, message: "Thanks — we've received your application." };
  } catch (err) {
    console.error("application submit error", err);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}
