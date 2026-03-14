export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-navy-500 border-t-transparent rounded-full animate-spin`} />
      {text && <p className="text-slate-500 font-medium text-sm">{text}</p>}
    </div>
  );
}
