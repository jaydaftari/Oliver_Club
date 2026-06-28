import { redirect } from "next/navigation";

// Account settings now live on the Profile tab.
export default function AccountRedirect() {
  redirect("/dashboard/profile");
}
