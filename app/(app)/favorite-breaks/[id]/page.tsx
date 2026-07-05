import { notFound } from "next/navigation";
import { getFavoriteBreakById } from "@/lib/breaks";
import BreakDetailView from "@/components/BreakDetailView";

export default async function BreakDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const breakData = getFavoriteBreakById(id);

  if (!breakData) {
    notFound();
  }

  return <BreakDetailView breakData={breakData} />;
}
