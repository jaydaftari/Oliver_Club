"use client";

import { useState } from "react";
import { signupEmail } from "@/app/actions/signup";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailForm() {
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState<{ text: string; kind: "error" | "success" | "" }>({
    text: "",
    kind: "",
  });
  const [btnLabel, setBtnLabel] = useState("I'm in for free");
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    setInvalid(false);
    if (msg.kind === "error") setMsg({ text: "", kind: "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(value.trim())) {
      setInvalid(true);
      setMsg({ text: "Please enter a valid email address.", kind: "error" });
      return;
    }
    setDisabled(true);
    setBtnLabel("Sending…");

    const result = await signupEmail(value);

    setBtnLabel("You're in ✓");
    setMsg({ text: result.message, kind: result.ok ? "success" : "error" });
    if (result.ok) setValue("");
    setTimeout(() => {
      setDisabled(false);
      setBtnLabel("I'm in for free");
    }, 2400);
  }

  return (
    <form className="email-form" onSubmit={handleSubmit} noValidate>
      <input
        className={`email-input${invalid ? " invalid" : ""}`}
        type="email"
        placeholder="your@email.com"
        autoComplete="email"
        required
        value={value}
        onChange={handleChange}
      />
      <button className="btn btn-primary" type="submit" disabled={disabled}>
        <span className="btn-label">{btnLabel}</span>
      </button>
      {msg.text && (
        <p className={`form-msg${msg.kind ? ` ${msg.kind}` : ""}`} aria-live="polite">
          {msg.text}
        </p>
      )}
    </form>
  );
}
