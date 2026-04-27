import { redirect } from 'next/navigation';

export default async function ChecklistBuilderPanelRouteRedirect({
  params,
}: {
  params: Promise<{ checklistId: string }>;
}) {
  const { checklistId } = await params;
  redirect(`/admin/checklists/${checklistId}`);
}
