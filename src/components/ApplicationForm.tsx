"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitApplication, type ApplicationInput } from "@/app/actions/apply";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldName = keyof ApplicationInput;

const initial: ApplicationInput = {
  name: "",
  email: "",
  phone: "",
  city: "",
  companyTitle: "",
  socialMedias: "",
  source: "",
};

export default function ApplicationForm({ source }: { source: string }) {
  const router = useRouter();
  const [values, setValues] = useState<ApplicationInput>({ ...initial, source });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState<{ text: string; kind: "" | "error" | "success" }>({
    text: "",
    kind: "",
  });
  const [done, setDone] = useState(false);

  function update<K extends FieldName>(key: K, value: ApplicationInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    if (serverMsg.kind === "error") setServerMsg({ text: "", kind: "" });
  }

  function validate(): boolean {
    const next: Partial<Record<FieldName, string>> = {};
    if (!values.name.trim()) next.name = "Please enter your name.";
    if (!EMAIL_RE.test(values.email.trim())) next.email = "Please enter a valid email address.";
    if (!values.companyTitle.trim()) next.companyTitle = "Please share your company or title.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || done) return;
    if (!validate()) return;

    setSubmitting(true);
    const result = await submitApplication(values);

    if (result.ok) {
      setDone(true);
      setServerMsg({ text: result.message, kind: "success" });
    } else {
      if (result.field) setErrors((prev) => ({ ...prev, [result.field!]: result.message }));
      setServerMsg({ text: result.message, kind: "error" });
    }
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="apply-success" role="status" aria-live="polite">
        <h2 className="h-section">Application received.</h2>
        <p className="lede" style={{ marginTop: 12 }}>
          Thanks, {values.name.split(" ")[0] || "friend"}. We review every application personally
          and will be in touch by email.
        </p>
        <div className="cta-row" style={{ marginTop: 28 }}>
          <button type="button" className="btn btn-ghost" onClick={() => router.push("/")}>
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="apply-form" onSubmit={onSubmit} noValidate>
      <Field
        id="name"
        label="Full name"
        required
        value={values.name}
        error={errors.name}
        onChange={(v) => update("name", v)}
        autoComplete="name"
      />
      <Field
        id="email"
        label="Email"
        type="email"
        required
        value={values.email}
        error={errors.email}
        onChange={(v) => update("email", v)}
        autoComplete="email"
        inputMode="email"
      />
      <Field
        id="phone"
        label="Phone number"
        hint="Optional"
        type="tel"
        value={values.phone}
        error={errors.phone}
        onChange={(v) => update("phone", v)}
        autoComplete="tel"
        inputMode="tel"
      />
      <Field
        id="city"
        label="Your city"
        hint="Optional"
        value={values.city}
        error={errors.city}
        onChange={(v) => update("city", v)}
        autoComplete="address-level2"
      />
      <Field
        id="companyTitle"
        label="Company / Title"
        required
        value={values.companyTitle}
        error={errors.companyTitle}
        onChange={(v) => update("companyTitle", v)}
        autoComplete="organization-title"
      />
      <Field
        id="socialMedias"
        label="Social medias"
        hint="LinkedIn, X, Instagram — anything that helps us get to know you"
        value={values.socialMedias}
        error={errors.socialMedias}
        onChange={(v) => update("socialMedias", v)}
      />

      <input type="hidden" name="source" value={values.source} />

      <div className="apply-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          <span>{submitting ? "Sending…" : "Submit application"}</span>
          {!submitting && <span className="arrow">→</span>}
        </button>
        {serverMsg.text && (
          <p className={`form-msg ${serverMsg.kind}`} aria-live="polite">
            {serverMsg.text}
          </p>
        )}
      </div>
    </form>
  );
}

type FieldProps = {
  id: FieldName;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
};

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  hint,
  error,
  autoComplete,
  inputMode,
}: FieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={`apply-field${error ? " has-error" : ""}`}>
      <label htmlFor={id} className="apply-label">
        {label}
        {required ? (
          <span className="apply-req" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        className="apply-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        aria-required={required ? "true" : undefined}
      />
      {error ? (
        <p id={`${id}-error`} className="apply-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="apply-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
