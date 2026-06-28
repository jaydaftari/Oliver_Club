"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  /** Label shown while the form action is in flight. Defaults to `children`. */
  pendingLabel?: ReactNode;
  style?: CSSProperties;
};

/**
 * Submit button that disables itself while the enclosing <form> action is
 * pending, preventing duplicate submissions (double-clicks). Must be rendered
 * inside a <form action={…}>.
 */
export function SubmitButton({ children, pendingLabel, style, ...rest }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      {...rest}
      type="submit"
      disabled={pending || rest.disabled}
      aria-busy={pending}
      style={{ ...style, ...(pending ? { opacity: 0.6, cursor: "default" } : null) }}
    >
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
