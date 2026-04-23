import { redirect } from 'next/navigation';

export default async function QuestionRouteRedirect({
  params,
}: {
  params: Promise<{ checklistId: string; sectionId: string; questionId: string }>;
}) {
  const { checklistId } = await params;
  redirect(`/admin/checklists/${checklistId}`);
}
