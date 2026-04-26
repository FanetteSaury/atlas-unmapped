// Atlas — preview-only route to validate the squad-room phone mockup before
// integrating into the post-project flow. Hardcoded sample data, not stored.

import { GroupChatSimulator } from "@/app/employer/squad/[slug]/_components/GroupChatSimulator";

export const metadata = { title: "Atlas — Squad room preview" };

export default function SquadPreviewPage() {
  return (
    <GroupChatSimulator
      project={{
        slug: "preview",
        title: "Phone shop opening — 3 techs",
        ward: "Madina",
        dayNeeded: "Friday Nov 28",
        iscoTitle: "Phone Repair Technician",
        employerHandle: "Karim's Phone Shop",
        notes: "₵180/day · full kit provided",
      }}
      candidates={[
        { handle: "AT-7421-Mad-T3", ward: "Madina", aiTier: 3 },
        { handle: "AT-7421-Mad-T2", ward: "Madina", aiTier: 2 },
        { handle: "AT-7421-EastLeg-T2", ward: "East Legon", aiTier: 2 },
        { handle: "AT-7421-Nima-T1", ward: "Nima", aiTier: 1 },
      ]}
    />
  );
}
