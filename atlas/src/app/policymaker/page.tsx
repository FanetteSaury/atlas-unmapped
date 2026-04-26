// /policymaker redirects to Paola's Data360-styled static dashboard.

import { redirect } from "next/navigation";

export default function PolicymakerPage() {
  redirect("/v2/policymaker.html");
}
