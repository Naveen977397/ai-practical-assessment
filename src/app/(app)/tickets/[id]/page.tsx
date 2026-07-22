import { TicketDetailPanel } from "@/components/TicketDetailPanel";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TicketDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <TicketDetailPanel ticketId={id} />;
}
