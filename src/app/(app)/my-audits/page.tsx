import { redirect } from 'next/navigation';

type MyAuditsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MyAuditsPage({ searchParams }: MyAuditsPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      query.set(key, value);
    } else if (Array.isArray(value)) {
      for (const entry of value) {
        query.append(key, entry);
      }
    }
  }

  const qs = query.toString();
  redirect(qs ? `/access?${qs}` : '/access');
}
