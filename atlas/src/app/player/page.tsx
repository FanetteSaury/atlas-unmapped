// /player redirects to Paola's polished static phone-mock demo.
// React PlayerQuest still exists at _components/ but is no longer the entry path.

import { redirect } from "next/navigation";

export default function PlayerPage() {
  redirect("/v2/player.html");
}
