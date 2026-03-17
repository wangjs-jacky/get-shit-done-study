interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
}

export default function PhoneFrame({ children, className = '' }: PhoneFrameProps) {
  return (
    <div
      className={`relative aspect-[19/37] h-[min(100%,calc(100vh-3rem))] w-auto max-w-[24rem] shrink-0 ${className}`}
    >
      {/* Phone outer frame */}
      <div
        className="relative rounded-[3rem] p-3"
        style={{
          background: 'linear-gradient(145deg, #2a2a2e, #1a1a1d)',
          boxShadow: `
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `
        }}
      >
        {/* Side buttons - Volume */}
        <div
          className="absolute -left-[3px] top-24 w-[3px] h-8 rounded-l-sm"
          style={{ background: 'linear-gradient(to right, #3a3a3e, #2a2a2e)' }}
        />
        <div
          className="absolute -left-[3px] top-36 w-[3px] h-12 rounded-l-sm"
          style={{ background: 'linear-gradient(to right, #3a3a3e, #2a2a2e)' }}
        />
        {/* Side buttons - Power */}
        <div
          className="absolute -right-[3px] top-32 w-[3px] h-16 rounded-r-sm"
          style={{ background: 'linear-gradient(to left, #3a3a3e, #2a2a2e)' }}
        />

        {/* Phone inner bezel */}
        <div
          className="rounded-[2.5rem] overflow-hidden"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)'
          }}
        >
          {/* Dynamic Island / Notch */}
          <div className="flex justify-center pt-3">
            <div
              className="w-28 h-8 rounded-full"
              style={{
                background: '#000',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)'
              }}
            />
          </div>

          {/* Screen content */}
          <div
            className="w-full aspect-[14/25] overflow-hidden"
            style={{ background: 'var(--color-bg)' }}
          >
            {children}
          </div>

          {/* Home indicator */}
          <div className="flex justify-center py-2" style={{ background: 'var(--color-bg)' }}>
            <div
              className="w-32 h-1 rounded-full"
              style={{ background: 'var(--color-text-muted)', opacity: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Reflection effect */}
      <div
        className="absolute inset-0 rounded-[3rem] pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)'
        }}
      />
    </div>
  );
}
