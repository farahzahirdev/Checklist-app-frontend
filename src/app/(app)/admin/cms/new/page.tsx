import { CMSPageEditor } from '@/components/cms/CMSPageEditor';
import { AdminCMSPageHeader } from '@/components/cms/AdminCMSPageHeader';

export const metadata = {
  title: 'Create New CMS Page',
};

export default function NewCMSPage() {
  return (
    <section className="space-y-5">
      <AdminCMSPageHeader variant="create" />
      <CMSPageEditor />
    </section>
  );
}
