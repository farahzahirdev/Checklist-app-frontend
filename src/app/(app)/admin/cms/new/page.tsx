import { CMSPageEditor } from '@/components/cms/CMSPageEditor';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Create New CMS Page',
};

export default function NewCMSPage() {
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
      <h1 className="text-3xl font-bold mb-6">Create New Page</h1>
      <CMSPageEditor />
    </div>
  );
}
