import { EnhancedCMSPageEditor } from '@/components/cms/EnhancedCMSPageEditor';
import { AdminCMSPageHeader } from '@/components/cms/AdminCMSPageHeader';

export const metadata = {
  title: 'Edit CMS Page',
};

export default async function EditCMSPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <section className="space-y-5">
      <AdminCMSPageHeader variant="edit" slug={slug} />
      <EnhancedCMSPageEditor pageId={slug} />
    </section>
  );
}
