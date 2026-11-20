/* Brand mark in the Durjog console style: indigo gradient tile, white line icon. */
export function BeaconLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div
        className="grid size-9 flex-none place-items-center rounded-[9px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"
        style={{ background: "linear-gradient(135deg,#2E3192,#4B4FD1)" }}
        aria-hidden
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 3h4l1 4H9z" />
          <path d="M9.5 7 8 20h8L14.5 7" />
          <path d="M6 20h12" />
          <path d="M4.5 5.5a6 6 0 0 0 0 5M19.5 5.5a6 6 0 0 1 0 5" />
        </svg>
      </div>
      {!compact && (
        <div className="min-w-0 leading-tight">
          <div className="font-display text-[17px] font-extrabold tracking-tight whitespace-nowrap">Beacon Ops</div>
          <div className="text-muted-foreground text-[11px] whitespace-nowrap">AI for Disaster Operations</div>
        </div>
      )}
    </div>
  );
}
