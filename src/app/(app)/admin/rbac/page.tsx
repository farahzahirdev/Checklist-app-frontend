import { redirect } from 'next/navigation';

export default function AdminRbacRedirectPage() {
  redirect('/admin/users?tab=rbac');
}
