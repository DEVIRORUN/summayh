import { redirect } from "next/navigation";

export default async function GigDetailsPage({
  params,
}: {
  params: Promise<{ gigId: string }>;
}) {
  const { gigId } = await params;
  redirect(`/gigs/${gigId}`);
}
