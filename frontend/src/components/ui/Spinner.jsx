/**
 * <Spinner />           — small inline spinner
 * <Spinner size="lg" /> — large spinner
 * <PageLoader />        — full-page centered loader
 */

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4 border', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-2' }
  return (
    <div
      className={`rounded-full border-brand-500/30 border-t-brand-500 animate-spin ${sizes[size]} ${className}`}
    />
  )
}

export function PageLoader({ text = 'Loading…' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
      style={{ background: 'rgba(15,15,26,0.85)', backdropFilter: 'blur(8px)' }}>
      <Spinner size="lg" />
      <p className="text-white/40 text-sm">{text}</p>
    </div>
  )
}

export default Spinner
