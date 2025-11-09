const VARIANTS = {
  success: 'border-emerald-200 bg-emerald-100 text-emerald-700',
  warning: 'border-yellow-200 bg-yellow-100 text-yellow-700',
  info: 'border-slate-200 bg-slate-100 text-slate-700',
  outline: 'text-slate-900',
  destructive: 'border-red-200 bg-red-100 text-red-700',
};

export function Badge({ variant, className, children }) {
  return (
    <div
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${
        VARIANTS[variant] || VARIANTS.info
      } ${className || ''}`}
    >
      {children}
    </div>
  );
}
