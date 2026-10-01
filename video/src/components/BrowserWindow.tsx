import { C, F, WINDOW } from '../theme'

/**
 * Minimal browser chrome around a 1600×900 viewport, placed at WINDOW on the
 * 1920×1080 frame. Children render in viewport CSS px.
 */
export function BrowserWindow({ url, children, style }: { url: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: WINDOW.x,
        top: WINDOW.y,
        width: WINDOW.w,
        height: WINDOW.h + WINDOW.bar,
        borderRadius: 12,
        overflow: 'hidden',
        background: '#0c1b30',
        boxShadow: '0 40px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(241,238,221,0.14)',
        ...style,
      }}
    >
      <div style={{ height: WINDOW.bar, display: 'flex', alignItems: 'center', gap: 18, padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: 'rgba(241,238,221,0.22)' }} />
          ))}
        </div>
        <div
          style={{
            flex: '0 1 520px',
            margin: '0 auto',
            transform: 'translateX(-40px)',
            height: 24,
            borderRadius: 6,
            background: 'rgba(241,238,221,0.07)',
            color: 'rgba(241,238,221,0.62)',
            fontFamily: F.mono,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            letterSpacing: 0.2,
          }}
        >
          <span style={{ color: C.rootWhite }}>localhost:5173</span>/{url}
        </div>
      </div>
      <div style={{ position: 'relative', width: WINDOW.w, height: WINDOW.h }}>{children}</div>
    </div>
  )
}
