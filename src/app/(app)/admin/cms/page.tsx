import { CMSPageList } from '@/components/cms/CMSPageList';

export const metadata = {
  title: 'CMS Pages',
};

export default function CMSPage() {
  return (
    <div className="p-6">
      <CMSPageList />
    </div>
  );
}
