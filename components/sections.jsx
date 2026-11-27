'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Reveal from './Reveal'
import Tilt from './Tilt'
import Magnetic from './Magnetic'
import { Arrow, Cross, Pin, SectionHead, SocialIcon, useSite } from './site'
import { useCollection } from '@/lib/data'

const ease = [.22, 1, .36, 1]

/* ---------- صفحة المؤتمرات ---------- */
export function Conferences() {
  const { s, typo } = useSite()
  const items = useCollection('conferences') || []
  const upcoming = (items || []).filter((c) => c.status !== 'past')
  const list = upcoming.length ? upcoming : (items || [])
  const fs = (v) => `calc(${v}rem * ${typo.scale})`
  return (
    <section className="pt-32 pb-20 px-6 relative min-h-screen cross-bg">
      <Cross className="absolute top-36 left-10 w-8 h-8 text-royal/10 spin-slower" />
      <div className="max-w-7xl mx-auto">
        <SectionHead eyebrow={s.conferencesEyebrow || 'CONFERENCES'} title={s.conferencesTitle || 'المؤتمرات\nالقادمة'} sub={s.conferencesSub} />
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {list.map((c, i) => (
            <Reveal key={c.id || i} delay={i * .08} className="h-full">
              <Tilt max={7} radius={32} className="h-full">
              <article className="glass card-frame rounded-[2rem] overflow-hidden hover-lift h-full flex flex-col">
                <div className="img-zoom h-56 overflow-hidden relative bg-gradient-to-br from-ice to-sky-100">
                  {c.image
                    ? <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full grid place-items-center"><Cross className="w-16 h-16 text-royal/25" /></div>}
                  <span className="absolute top-4 right-4 glass rounded-full px-4 py-1.5 text-xs font-bold">{c.date}</span>
                  <span className="absolute top-4 left-4 w-8 h-8 glass rounded-full grid place-items-center"><Cross className="text-teal w-3.5 h-3.5" /></span>
                </div>
                <div className="p-7 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal tracking-wide"><Pin /> {c.location}</div>
                  <h3 className="font-black mt-2 leading-snug" style={{ fontSize: fs(typo.cardTitle) }}>{c.title}</h3>
                  <p className="text-ink/55 leading-relaxed mt-3 flex-1" style={{ fontSize: fs(typo.cardBody) }}>{c.desc}</p>
                  <a href={c.fbLink || '#'} target="_blank" rel="noreferrer"
                    className="btn-sheen mt-6 inline-flex items-center justify-center gap-2 bg-gradient-to-l from-royal to-teal text-white rounded-full px-6 py-3.5 text-sm font-bold hover:opacity-90 transition-opacity" style={{ fontSize: fs(typo.navLink) }}>
                    {s.conferenceFollowCta || 'تابع المؤتمر على فيسبوك'} <Arrow />
                  </a>
                </div>
              </article>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- صفحة صور المؤتمرات ---------- */
export function Gallery() {
  const { s } = useSite()
  const items = useCollection('gallery') || []
  const [lightbox, setLightbox] = useState(null)
  return (
    <section className="pt-32 pb-20 px-6 min-h-screen bg-gradient-to-b from-transparent via-ice/60 to-transparent">
      <div className="max-w-7xl mx-auto">
        <SectionHead eyebrow={s.galleryEyebrow || 'GALLERY'} title={s.galleryTitle || 'صور\nالمؤتمرات'} sub={s.gallerySub} />
        <div className="mt-10 columns-1 sm:columns-2 lg:columns-3 gap-6 [&>*]:mb-6">
          {(items || []).map((g, i) => (
            <Reveal key={g.id || i} delay={(i % 3) * .08} className="break-inside-avoid">
              <Tilt max={7} radius={32}>
              <div className="glass card-frame rounded-[2rem] p-3 hover-lift">
                <div className="grid gap-2 rounded-[1.6rem] overflow-hidden"
                  style={{ gridTemplateColumns: (g.images || []).length > 1 ? '2fr 1fr' : '1fr' }}>
                  {(g.images || []).slice(0, 3).map((src, j) => (
                    <button key={j} onClick={() => setLightbox(src)}
                      className={`img-zoom overflow-hidden bg-gradient-to-br from-ice to-sky-100 ${j === 0 ? 'row-span-2 h-64' : 'h-[7.6rem]'}`}>
                      <img src={src} alt={g.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {(!g.images || !g.images.length) && (
                    <div className="h-48 grid place-items-center bg-gradient-to-br from-ice to-sky-100 rounded-[1.6rem]">
                      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-royal/30"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" /><circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2" /><path d="m21 15-4.5-4.5L6 21" stroke="currentColor" strokeWidth="2" /></svg>
                    </div>
                  )}
                </div>
                <div className="px-4 py-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-black leading-snug text-lg">{g.title}</h3>
                    {g.event && <div className="text-xs font-bold text-ink/45 mt-1">{g.event}</div>}
                  </div>
                  {g.link && (
                    <a href={g.link} target="_blank" rel="noreferrer" className="shrink-0 inline-flex items-center gap-2 text-xs font-bold text-royal border border-royal/30 rounded-full px-4 py-2 hover:bg-royal hover:text-white transition-colors">
                      {s.galleryLinkedInCta || 'لينكدإن'} <Arrow />
                    </a>
                  )}
                </div>
              </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-ink/80 backdrop-blur-sm grid place-items-center p-6"
            onClick={() => setLightbox(null)}>
            <motion.img initial={{ scale: .85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .9, opacity: 0 }}
              transition={{ duration: .5, ease }}
              src={lightbox} className="max-h-[85vh] max-w-full rounded-3xl shadow-2xl" alt="" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/* ---------- صفحة الأبحاث ---------- */
export function Research() {
  const { s, typo } = useSite()
  const items = useCollection('research') || []
  const fs = (v) => `calc(${v}rem * ${typo.scale})`
  return (
    <section className="pt-32 pb-20 px-6 relative min-h-screen">
      <Cross className="absolute bottom-16 left-10 w-10 h-10 text-royal/10 float-slower" />
      <div className="max-w-7xl mx-auto">
        <SectionHead eyebrow={s.researchEyebrow || 'RESEARCH'} title={s.researchTitle || 'أبحاثي\nالمنشورة'} sub={s.researchSub} />
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(items || []).map((r, i) => (
            <Reveal key={r.id || i} delay={(i % 3) * .08} className="h-full">
              <Tilt max={7} radius={32} className="h-full">
              <article className="glass card-frame rounded-[2rem] p-7 hover-lift h-full flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold bg-teal/10 text-teal rounded-full px-3 py-1.5">{r.journal || 'بحث'}</span>
                  <span className="text-xs font-bold text-ink/40">{r.year}</span>
                </div>
                {r.image && (
                  <div className="img-zoom h-40 overflow-hidden rounded-2xl mt-5 bg-gradient-to-br from-ice to-sky-100">
                    <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <h3 className="font-black mt-5 leading-snug" style={{ fontSize: fs(typo.cardTitle) }}>{r.title}</h3>
                {r.authors && <div className="text-xs font-bold text-ink/45 mt-2">{r.authors}</div>}
                <p className="text-ink/55 leading-relaxed mt-3 line-clamp-3 flex-1" style={{ fontSize: fs(typo.cardBody) }}>{r.abstract}</p>
                <a href={r.link || '#'} target="_blank" rel="noreferrer"
                  className="btn-sheen mt-6 inline-flex items-center justify-center gap-2 border-2 border-ink text-ink rounded-full px-6 py-3 font-bold hover:bg-ink hover:text-white transition-colors" style={{ fontSize: fs(typo.navLink) }}>
                  {s.researchReadCta || 'اقرأ البحث'} <Arrow />
                </a>
              </article>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- صفحة عنّي ---------- */
export function About() {
  const { s, typo } = useSite()
  const socials = [
    ['facebook', 'فيسبوك'], ['linkedin', 'لينكدإن'], ['instagram', 'إنستجرام'],
    ['youtube', 'يوتيوب'], ['tiktok', 'تيك توك'],
  ]
  const fs = (v) => `calc(${v}rem * ${typo.scale})`
  return (
    <section className="pt-32 pb-20 px-6 relative overflow-hidden min-h-screen cross-bg">
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-teal/10 blur-3xl" />
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center relative z-10">
        <div>
          <SectionHead eyebrow={s.aboutEyebrow || 'ABOUT'} title={s.aboutTitle || 'اعرف\nعنّي أكتر'} />
          <Reveal delay={.25}>
            <p className="mt-6 text-ink/60 leading-loose max-w-lg" style={{ fontSize: fs(typo.sectionSub) }}>{s.about}</p>
          </Reveal>
          <Reveal delay={.4}>
            <Magnetic>
              <a href={`mailto:${s.contactEmail || 'contact@example.com'}`}
                className="btn-sheen mt-8 inline-flex items-center gap-2 bg-gradient-to-l from-royal to-teal text-white rounded-full px-8 py-4 font-bold hover:opacity-90 transition-opacity" style={{ fontSize: fs(typo.navLink) }}>
                {s.aboutContactCta || 'تواصل معايا'} <Arrow />
              </a>
            </Magnetic>
          </Reveal>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {s.heroImage && (
            <Reveal className="sm:col-span-2 flex justify-center">
              <Tilt max={10} radius={999}>
                <img src={s.heroImage} alt="صورتك الشخصية"
                  className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover ring-4 ring-white shadow-2xl shadow-royal/25 float-soft" />
              </Tilt>
            </Reveal>
          )}
          {socials.map(([k, label], i) => (
            <Reveal key={k} delay={.1 + i * .06} className={i === 0 ? 'sm:col-span-2' : ''}>
              <SocialIcon name={k} href={s.socials?.[k]} label={label} fontSize={typo.navLink * typo.scale} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
