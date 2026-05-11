import { EnhancedCMSPageEditor } from '@/components/cms/EnhancedCMSPageEditor';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/cms"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pages
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">Edit Page: {slug}</h1>
      <EnhancedCMSPageEditor pageId={slug} />
    </div>
  );
}
