interface StatusDotProps {
  status: 'green' | 'yellow' | 'red' | 'none'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StatusDot({ status, size = 'md', className = '' }: StatusDotProps) {
  const colors = {
    green: 'bg-brand',
    yellow: 'bg-amber-400',
    red: 'bg-red-500',
    none: 'bg-slate-300',
  }

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  const pulse = status === 'red' ? 'animate-pulse' : ''

  return (
    <span
      className={`inline-block rounded-full flex-shrink-0 ${colors[status]} ${sizes[size]} ${pulse} ${className}`}
      aria-label={`Status: ${status}`}
    />
  )
}
