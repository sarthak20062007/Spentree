import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-12 px-8 border-t border-slate-200 bg-slate-50">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-screen-2xl mx-auto text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="font-headline font-bold text-emerald-900">Spentree</span>
          <span>© 2026 Spentree. The Precision Naturalist.</span>
        </div>
        <div className="flex gap-6">
          <Link className="text-slate-400 hover:text-emerald-600 hover:underline transition-all" href="#">Privacy</Link>
          <Link className="text-slate-400 hover:text-emerald-600 hover:underline transition-all" href="#">Terms</Link>
          <Link className="text-slate-400 hover:text-emerald-600 hover:underline transition-all" href="#">Support</Link>
          <Link className="text-slate-400 hover:text-emerald-600 hover:underline transition-all" href="#">API</Link>
        </div>
      </div>
    </footer>
  );
}
