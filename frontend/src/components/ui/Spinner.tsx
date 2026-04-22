export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-4' }[size];
  return (
    <div className={`${s} border-warm-border border-t-accent rounded-full animate-spin`} />
  );
}

export function PageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-64">
      <Spinner size="lg" />
    </div>
  );
}
