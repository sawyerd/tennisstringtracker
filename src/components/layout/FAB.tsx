interface FABProps {
  onClick: () => void
}

export function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Log session"
      className="fixed bottom-24 right-4 z-40 flex items-center gap-2 px-5 py-3.5 bg-brand text-white rounded-full shadow-lg hover:bg-brand-muted active:scale-95 transition-all"
    >
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      <span className="text-sm font-semibold">Log Session</span>
    </button>
  )
}
