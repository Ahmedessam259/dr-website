'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Molecule3D from '@/components/Molecule3D'
import Reveal from '@/components/Reveal'
import Counter from '@/components/Counter'
import Tilt from '@/components/Tilt'
import Cursor from '@/components/Cursor'
import { useSettings, useCollection } from '@/lib/data'

const ease = [.22, 1, .36, 1]

/* ---------- أيقونات ---------- */
const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5m0 0 6 6m-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ICONS = {
  facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  tiktok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
}

function SocialIcon({ name, href, label }) {
  return (
    <Tilt max={8} radius={16}>
    <a href={href || '#'} target="_blank" rel="noreferrer" aria-label={label}
      className="group flex items-center gap-3 glass rounded-2xl px-5 py-4 hover-lift">
      <span className="w-10 h-10 rounded-xl bg-ink text-white grid place-items-center group-hover:bg-royal transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d={ICONS[name]} /></svg>
      </span>
      <span className="font-bold text-sm">{label}</span>
    </a>
    </Tilt>
  )
}

/* ---------- نص بيظهر سطر سطر ---------- */
function Lines({ text, className = '' }) {
  const lines = String(text || '').split('\n')
  return (
    <span className={className}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-1">
          <motion.span className="block"
            initial={{ y: '115%' }} whileInView={{ y: 0 }} viewport={{ once: true }}
            transition={{ duration: 1.05, delay: i * .13, ease }}>
            {l}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

/* ---------- شريط التنقل ---------- */
function Navbar({ s }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 40)
    f(); window.addEventListener('scroll', f)
    return () => window.removeEventListener('scroll', f)
  }, [])
  const links = [['#conferences', 'المؤتمرات'], ['#gallery', 'صور المؤتمرات'], ['#research', 'الأبحاث'], ['#about', 'عنّي']]
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'glass' : 'bg-transparent'}`}>
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-3">
          <Tilt max={16} radius={16} glare={false}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-royal to-navy grid place-items-center text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" /></svg>
          </div>
          </Tilt>
          <div className="leading-tight">
            <div className="font-serif font-bold text-lg">{s.brand || 'د. طبيب'}</div>
            <div className="text-[10px] tracking-[.32em] text-navy/60 font-bold">MEDICINE · CREATOR</div>
          </div>
        </a>
        <ul className="hidden md:flex items-center gap-8 text-sm font-bold">
          {links.map(([h, t]) => (
            <li key={h}><a className="text-ink/70 hover:text-royal transition-colors" href={h}>{t}</a></li>
          ))}
        </ul>
        <a href={s.socials?.facebook || '#'} target="_blank" rel="noreferrer"
          className="hidden sm:inline-flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-royal transition-colors">
          تابعني على فيسبوك <Arrow />
        </a>
      </nav>
    </header>
  )
}

/* ---------- الهيرو ---------- */
function Hero({ s, conferences }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yText = useTransform(scrollYProgress, [0, 1], [0, 130])
  const yPanel = useTransform(scrollYProgress, [0, 1], [0, -90])

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  useEffect(() => {
    const h = (e) => { mx.set(e.clientX / window.innerWidth - .5); my.set(e.clientY / window.innerHeight - .5) }
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [mx, my])
  const tx = useTransform(mx, [-.5, .5], [-16, 16])
  const b1x = useTransform(mx, [-.5, .5], [55, -55])
  const b1y = useTransform(my, [-.5, .5], [35, -35])
  const b2x = useTransform(mx, [-.5, .5], [-65, 65])
  const b2y = useTransform(my, [-.5, .5], [-45, 45])

  const nextUp = (conferences || []).find((c) => c.status !== 'past')

  return (
    <section id="top" ref={ref} className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
      <motion.div style={{ x: b1x, y: b1y }} className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full bg-royal/10 blur-3xl" />
      <motion.div style={{ x: b2x, y: b2y }} className="absolute top-1/3 -right-52 w-[620px] h-[620px] rounded-full bg-sky-200/50 blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center relative z-10 w-full">
        <motion.div style={{ y: yText, x: tx }}>
          <Reveal y={20}>
            <span className="eyebrow">
              <span className="w-2 h-2 rounded-full bg-royal live-dot" />
              طب بشري · صانع محتوى · باحث
            </span>
          </Reveal>

          <h1 className="font-serif text-[15vw] sm:text-7xl xl:text-[6.2rem] leading-[1.04] font-bold mt-6">
            <Lines text={s.heroTitle || 'طبّ.\nعلم.\nإنسانية.'} />
          </h1>

          <Reveal delay={.4}>
            <p className="mt-8 text-lg text-ink/60 max-w-md leading-relaxed">{s.heroSub}</p>
          </Reveal>

          <Reveal delay={.55}>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#conferences" className="inline-flex items-center gap-2 bg-ink text-white rounded-full px-8 py-4 font-bold hover:bg-royal transition-colors">
                المؤتمرات القادمة <Arrow />
              </a>
              <a href="#research" className="inline-flex items-center gap-2 glass rounded-full px-8 py-4 font-bold hover:border-royal/50 transition-colors">
                الأبحاث المنشورة
              </a>
            </div>
          </Reveal>

          <Reveal delay={.7}>
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(s.stats || []).map((st, i) => (
                <Tilt key={i} max={12} radius={16}>
                <div className="glass rounded-2xl px-4 py-5 text-center hover-lift">
                  <div className="font-serif text-3xl font-bold text-navy"><Counter to={Number(st.value) || 0} suffix={st.suffix || ''} /></div>
                  <div className="text-[11px] font-bold text-ink/50 mt-1 leading-snug">{st.label}</div>
                </div>
                </Tilt>
              ))}
            </div>
          </Reveal>
        </motion.div>

        <motion.div style={{ y: yPanel }} className="relative">
          <Tilt max={7} radius={40}>
          <div className="glass rounded-[2.5rem] p-3 relative overflow-hidden h-[520px]">
            <div className="absolute inset-3 rounded-[2rem] overflow-hidden bg-gradient-to-b from-white/40 to-ice/60">
              <Molecule3D />
            </div>

            <div className="absolute top-8 right-8 glass rounded-full px-4 py-2 text-xs font-bold float-slow">DNA · Genome</div>
            <div className="absolute top-24 left-8 glass rounded-full px-4 py-2 text-xs font-bold float-slower">ECG · Live</div>
            <div className="absolute bottom-40 right-10 glass rounded-full px-4 py-2 text-xs font-bold float-slow" style={{ animationDelay: '2s' }}>Research</div>

            <div className="absolute bottom-6 inset-x-6 glass rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-navy">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 live-dot" /> LIVE UPDATE
                </span>
                <span className="text-[11px] font-bold text-ink/40">من الميدان الطبي</span>
              </div>
              <svg viewBox="0 0 240 60" className="w-full h-10 my-2" preserveAspectRatio="none">
                <path className="ecg-path" d="M0 30 H60 l8-18 10 36 8-28 6 10 H150 l8-14 8 22 6-8 H240"
                  fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-sm font-bold text-ink/70 truncate">
                {nextUp ? `المؤتمر الجاي: ${nextUp.title} — ${nextUp.date || ''}` : 'تابع أحدث المؤتمرات والأبحاث أول بأول'}
              </p>
            </div>
          </div>
          </Tilt>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- عناوين الأقسام ---------- */
function SectionHead({ eyebrow, title, sub }) {
  return (
    <div className="max-w-3xl">
      <Reveal y={20}>
        <span className="eyebrow"><span className="w-2 h-2 rounded-full bg-royal live-dot" />{eyebrow}</span>
      </Reveal>
      <h2 className="font-serif text-4xl md:text-6xl font-bold mt-4 leading-tight">
        <Lines text={title} />
      </h2>
      {sub && <Reveal delay={.2}><p className="mt-5 text-ink/55 leading-relaxed">{sub}</p></Reveal>}
    </div>
  )
}

/* ---------- المؤتمرات ---------- */
function Conferences({ items }) {
  const upcoming = (items || []).filter((c) => c.status !== 'past')
  const list = upcoming.length ? upcoming : (items || [])
  return (
    <section id="conferences" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHead eyebrow="CONFERENCES" title={'المؤتمرات\nالقادمة'} sub="هنا بتعرف على كل المؤتمرات الطبية اللي بشارك فيها — اعمل فولو لصفحة المؤتمر على فيسبوك وتابع كل التفاصيل أول بأول." />
        <div className="mt-14 grid md:grid-cols-2 gap-6">
          {list.map((c, i) => (
            <Reveal key={c.id || i} delay={i * .08} className="h-full">
              <Tilt max={7} radius={32} className="h-full">
              <article className="glass rounded-[2rem] overflow-hidden hover-lift h-full flex flex-col">
                <div className="img-zoom h-56 overflow-hidden relative bg-gradient-to-br from-ice to-sky-100">
                  {c.image
                    ? <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full grid place-items-center"><svg width="72" height="72" viewBox="0 0 24 24" fill="none" className="text-royal/30"><path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg></div>}
                  <span className="absolute top-4 right-4 glass rounded-full px-4 py-1.5 text-xs font-bold">{c.date}</span>
                </div>
                <div className="p-7 flex flex-col flex-1">
                  <div className="text-xs font-bold text-royal tracking-widest">{c.location}</div>
                  <h3 className="font-serif text-2xl font-bold mt-2 leading-snug">{c.title}</h3>
                  <p className="text-ink/55 text-sm leading-relaxed mt-3 flex-1">{c.desc}</p>
                  <a href={c.fbLink || '#'} target="_blank" rel="noreferrer"
                    className="mt-6 inline-flex items-center justify-center gap-2 bg-ink text-white rounded-full px-6 py-3.5 text-sm font-bold hover:bg-royal transition-colors">
                    تابع المؤتمر على فيسبوك <Arrow />
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

/* ---------- الجملة الوسطى (زي الفيديو) ---------- */
function Statement() {
  const words = 'العلم مش بس شهادة — ده رحلة بتتعاش كل يوم.'.split(' ')
  const boldFrom = words.length - 4
  return (
    <section className="py-32 px-6 text-center relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-royal/5 blur-3xl -translate-y-1/2" />
      <h2 className="relative text-3xl md:text-5xl font-bold leading-snug max-w-4xl mx-auto">
        {words.map((w, i) => (
          <motion.span key={i}
            initial={{ opacity: .12 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-120px' }}
            transition={{ delay: i * .06, duration: .5 }}
            className={i >= boldFrom ? 'font-serif text-royal' : ''}>
            {w}{' '}
          </motion.span>
        ))}
      </h2>
    </section>
  )
}

/* ---------- صور المؤتمرات ---------- */
function Gallery({ items }) {
  const [lightbox, setLightbox] = useState(null)
  return (
    <section id="gallery" className="py-28 px-6 bg-gradient-to-b from-transparent via-ice/60 to-transparent">
      <div className="max-w-7xl mx-auto">
        <SectionHead eyebrow="GALLERY" title={'صور\nالمؤتمرات'} sub="لقطات من المؤتمرات اللي حضرتها — وألبومات مربوطة مباشرة بلينكدإن." />
        <div className="mt-14 columns-1 sm:columns-2 lg:columns-3 gap-6 [&>*]:mb-6">
          {(items || []).map((g, i) => (
            <Reveal key={g.id || i} delay={(i % 3) * .08} className="break-inside-avoid">
              <Tilt max={7} radius={32}>
              <div className="glass rounded-[2rem] p-3 hover-lift">
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
                    <h3 className="font-serif font-bold text-lg leading-snug">{g.title}</h3>
                    {g.event && <div className="text-xs font-bold text-ink/45 mt-1">{g.event}</div>}
                  </div>
                  {g.link && (
                    <a href={g.link} target="_blank" rel="noreferrer" className="shrink-0 inline-flex items-center gap-2 text-xs font-bold text-royal border border-royal/30 rounded-full px-4 py-2 hover:bg-royal hover:text-white transition-colors">
                      لينكدإن <Arrow />
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

/* ---------- الأبحاث ---------- */
function Research({ items }) {
  return (
    <section id="research" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHead eyebrow="RESEARCH" title={'أبحاثي\nالمنشورة'} sub="كل ورقة بحثية نشرتها — اضغط عشان تقرأها على لينكدإن أو المجلة." />
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(items || []).map((r, i) => (
            <Reveal key={r.id || i} delay={(i % 3) * .08} className="h-full">
              <Tilt max={7} radius={32} className="h-full">
              <article className="glass rounded-[2rem] p-7 hover-lift h-full flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold bg-royal/10 text-royal rounded-full px-3 py-1.5">{r.journal || 'بحث'}</span>
                  <span className="text-xs font-bold text-ink/40">{r.year}</span>
                </div>
                {r.image && (
                  <div className="img-zoom h-40 overflow-hidden rounded-2xl mt-5 bg-gradient-to-br from-ice to-sky-100">
                    <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <h3 className="font-serif text-xl font-bold mt-5 leading-snug">{r.title}</h3>
                {r.authors && <div className="text-xs font-bold text-ink/45 mt-2">{r.authors}</div>}
                <p className="text-sm text-ink/55 leading-relaxed mt-3 line-clamp-3 flex-1">{r.abstract}</p>
                <a href={r.link || '#'} target="_blank" rel="noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 border-2 border-ink text-ink rounded-full px-6 py-3 text-sm font-bold hover:bg-ink hover:text-white transition-colors">
                  اقرأ البحث <Arrow />
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

/* ---------- عنّي + السوشيال ---------- */
function About({ s }) {
  const socials = [
    ['facebook', 'فيسبوك'], ['linkedin', 'لينكدإن'], ['instagram', 'إنستجرام'],
    ['youtube', 'يوتيوب'], ['tiktok', 'تيك توك'],
  ]
  return (
    <section id="about" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-royal/10 blur-3xl" />
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center relative z-10">
        <div>
          <SectionHead eyebrow="ABOUT" title={'اعرف\nعنّي أكتر'} />
          <Reveal delay={.25}>
            <p className="mt-6 text-lg text-ink/60 leading-loose max-w-lg">{s.about}</p>
          </Reveal>
          <Reveal delay={.4}>
            <a href={`mailto:contact@example.com`}
              className="mt-8 inline-flex items-center gap-2 bg-royal text-white rounded-full px-8 py-4 font-bold hover:bg-ink transition-colors">
              تواصل معايا <Arrow />
            </a>
          </Reveal>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {socials.map(([k, label], i) => (
            <Reveal key={k} delay={i * .06} className={i === 0 ? 'sm:col-span-2' : ''}>
              <SocialIcon name={k} href={s.socials?.[k]} label={label} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer({ s }) {
  return (
    <footer className="border-t border-ink/10 py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-serif font-bold">{s.brand || 'د. طبيب'}</div>
        <div className="text-xs font-bold text-ink/40 tracking-widest">MEDICINE · SCIENCE · HUMANITY</div>
        <div className="text-xs font-bold text-ink/40">© 2026 — كل الحقوق محفوظة</div>
      </div>
    </footer>
  )
}

/* ---------- الصفحة ---------- */
export default function Page() {
  const settings = useSettings()
  const conferences = useCollection('conferences')
  const gallery = useCollection('gallery')
  const research = useCollection('research')

  return (
    <div className="grain">
      <Cursor />
      <Navbar s={settings} />
      <Hero s={settings} conferences={conferences} />
      <Conferences items={conferences} />
      <Statement />
      <Gallery items={gallery} />
      <Research items={research} />
      <About s={settings} />
      <Footer s={settings} />
    </div>
  )
}
