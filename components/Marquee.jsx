'use client'

import { useSite } from './site'

// شريط متحرك بين الأقسام — المحتوى بيتعدل من الأدمن (settings.marquee)
export default function Marquee({ items }) {
  const site = useSite()
  const list = (items || site?.s?.marquee || []).filter(Boolean)
  if (!list.length) return null
  const row = [...list, ...list, ...list, ...list]
  return (
    <div className="marquee relative overflow-hidden border-y border-ink/10 bg-gradient-to-l from-ice/90 via-white/70 to-ice/90 py-4">
      <div className="marquee-track items-center" dir="ltr">
        {row.map((t, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span className="font-black text-navy/70 text-lg whitespace-nowrap px-6">{t}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" className="text-teal heartbeat shrink-0">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-mist to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-mist to-transparent" />
    </div>
  )
}
