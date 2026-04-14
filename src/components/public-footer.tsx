import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="border-t border-[#243d68] bg-[#060f23]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-[#a7b7d3] sm:px-6 md:px-8 md:text-base">
        <p>© 2025 Checklist KB. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/about-us" className="hover:text-[#dce8ff]">Privacy Policy</Link>
          <span>•</span>
          <Link href="/about-us" className="hover:text-[#dce8ff]">Terms of Service</Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-[#dce8ff]">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
