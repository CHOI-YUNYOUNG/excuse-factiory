import Link from 'next/link'

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-zinc-900">
          <span>⚙️</span>
          <span>변명공작소</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/ranking"
            className="px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            🏆 명예의 전당
          </Link>
          <Link
            href="/collection"
            className="px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            💾 내 보관함
          </Link>
        </div>
      </div>
    </nav>
  )
}
