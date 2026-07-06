import BreakDetailClient from "@/components/BreakDetailClient";

export default async function BreakDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BreakDetailClient id={id} />;
}
