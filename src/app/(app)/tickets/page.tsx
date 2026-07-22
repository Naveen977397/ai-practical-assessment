import { Suspense } from "react";
import { TicketListPanel } from "@/components/TicketListPanel";

export default function TicketsPage() {
  return (
    <Suspense fallback={<p className="app-muted">Loading...</p>}>
      <TicketListPanel />
    </Suspense>
  );
}
