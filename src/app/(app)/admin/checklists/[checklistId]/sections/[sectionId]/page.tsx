import { redirect } from 'next/navigation';

export default async function SectionRouteRedirect({
  params,
}: {
  params: Promise<{ checklistId: string; sectionId: string }>;
}) {
  const { checklistId } = await params;
  redirect(`/admin/checklists/${checklistId}`);
}
