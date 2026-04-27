import { redirect } from 'next/navigation';

export default async function NewQuestionRouteRedirect({
  params,
}: {
  params: Promise<{ checklistId: string; sectionId: string }>;
}) {
  const { checklistId } = await params;
  redirect(`/admin/checklists/${checklistId}`);
}
