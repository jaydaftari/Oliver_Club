import Link from "next/link";
import { getMemberByToken } from "@/lib/members";
import AuthCard from "@/components/member/AuthCard";
import { T } from "@/components/member/theme";
import ResetForm from "./ResetForm";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const tokenRaw = sp.token;
  const token = (Array.isArray(tokenRaw) ? tokenRaw[0] : tokenRaw) ?? "";

  const member = token ? await getMemberByToken(token) : null;

  if (!member) {
    return (
      <AuthCard
        eyebrow="Set password"
        title="This link isn't valid."
        subtitle="The setup link is missing, has already been used, or has expired."
        footer={
          <span>
            <Link href="/forgot-password" style={{ color: T.accent, textDecoration: "none" }}>
              Request a new link
            </Link>{" "}
            or{" "}
            <Link href="/login" style={{ color: T.accent, textDecoration: "none" }}>
              sign in
            </Link>
          </span>
        }
      >
        <div
          style={{
            padding: 16,
            border: "1px solid rgba(29,30,26,0.28)",
            borderRadius: 12,
            background: "rgba(29,30,26,0.04)",
            fontSize: 13.5,
            lineHeight: 1.55,
            color: "rgba(29,30,26,0.75)",
          }}
        >
          Ask your Olivier Club administrator to send you a fresh link.
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Set password"
      title="Choose your password."
      subtitle={`Setting the password for ${member.email}.`}
    >
      <ResetForm token={token} />
    </AuthCard>
  );
}
