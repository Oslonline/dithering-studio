import { redirect } from "next/navigation";

export default function LegacyPrivacyRedirect() {
  redirect("/en/Privacy");
}
