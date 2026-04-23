import { redirect } from 'next/navigation';

export default function ChecklistPanelRouteRedirect() {
  redirect('/admin/checklists');
}
