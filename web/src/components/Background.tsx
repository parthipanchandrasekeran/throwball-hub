export function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-stage relative flex flex-col flex-1">
      <div className="absolute inset-0 grid-overlay pointer-events-none" />
      <div className="relative flex flex-col flex-1">{children}</div>
    </div>
  );
}
