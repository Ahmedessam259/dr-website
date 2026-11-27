'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion'
import Molecule3D from './Molecule3D'
import Reveal from './Reveal'
import Counter from './Counter'
import Tilt from './Tilt'
import Magnetic from './Magnetic'
import { Arrow, Cross, Lines, useSite } from './site'
import { useCollection } from '@/lib/data'

/* ---------- الهيرو ---------- */
export function Hero() {
  const { s, typo } = useSite()
  const conferences = useCollection('conferences') || []
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
  const fs = (v) => `calc(${v}rem * ${typo.scale})`
  const heroTitleStyle = {
    fontSize: `clamp(2.5rem, ${typo.heroTitleMobile}vw, ${typo.heroTitle * typo.scale}rem)`,
    lineHeight: 1.04,
  }

  return (
    <section id="top" ref={ref} className="relative min-h-[92vh] flex items-center pt-28 pb-8 overflow-hidden cross-bg">
      <motion.div style={{ x: b1x, y: b1y }} className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full bg-royal/10 blur-3xl" />
      <motion.div style={{ x: b2x, y: b2y }} className="absolute top-1/3 -right-52 w-[620px] h-[620px] rounded-full bg-teal/10 blur-3xl" />
      <Cross className="absolute top-28 left-10 w-10 h-10 text-royal/10 spin-slower" />
      <Cross className="absolute bottom-16 right-1/3 w-6 h-6 text-teal/15 float-slower" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center relative z-10 w-full">
        <motion.div style={{ y: yText, x: tx }}>
          {s.heroImage && (
            <Reveal y={20}>
              <Tilt max={10} radius={999} className="inline-block mb-6">
                <img src={s.heroImage} alt="صورتك الشخصية"
                  className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover ring-4 ring-white shadow-2xl shadow-royal/25 float-soft" />
              </Tilt>
            </Reveal>
          )}
          <Reveal y={20}>
            <span className="eyebrow glass rounded-full px-4 py-2" style={{ fontSize: fs(typo.eyebrow) }}>
              <span className="w-2 h-2 rounded-full bg-teal live-dot" />
              {s.heroEyebrow || 'طب بشري · صانع محتوى · باحث'}
            </span>
          </Reveal>

          <h1 className="font-black mt-6" style={heroTitleStyle}>
            <Lines text={s.heroTitle || 'طبّ.\nعلم.\nإنسانية.'} className="gradient-text" />
          </h1>

          <Reveal delay={.4}>
            <p className="mt-6 text-ink/60 max-w-md leading-relaxed" style={{ fontSize: fs(typo.heroSub) }}>{s.heroSub}</p>
          </Reveal>

          <Reveal delay={.55}>
            <div className="mt-8 flex flex-wrap gap-4">
              <Magnetic>
                <Link href="/conferences" className="btn-sheen inline-flex items-center gap-2 bg-ink text-white rounded-full px-8 py-4 font-bold hover:bg-royal transition-colors" style={{ fontSize: fs(typo.navLink) }}>
                  {s.heroBtnPrimary || 'المؤتمرات القادمة'} <Arrow />
                </Link>
              </Magnetic>
              <Magnetic>
                <Link href="/research" className="inline-flex items-center gap-2 glass rounded-full px-8 py-4 font-bold hover:border-royal/50 transition-colors" style={{ fontSize: fs(typo.navLink) }}>
                  {s.heroBtnSecondary || 'الأبحاث المنشورة'}
                </Link>
              </Magnetic>
            </div>
          </Reveal>

          <Reveal delay={.7}>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(s.stats || []).map((st, i) => (
                <Tilt key={i} max={12} radius={16}>
                <div className="glass rounded-2xl px-4 py-5 text-center hover-lift float-soft" style={{ animationDelay: `${i * .7}s` }}>
                  <div className="font-serif font-bold text-navy" style={{ fontSize: fs(typo.statsNumber) }}><Counter to={Number(st.value) || 0} suffix={st.suffix || ''} /></div>
                  <div className="font-bold text-ink/50 mt-1 leading-snug" style={{ fontSize: fs(typo.statsLabel) }}>{st.label}</div>
                </div>
                </Tilt>
              ))}
            </div>
          </Reveal>
        </motion.div>

        {/* بانل المونيتور الطبي الغامق */}
        <motion.div style={{ y: yPanel }} className="relative">
          <Tilt max={7} radius={40}>
          <div className="deep-panel rounded-[2.5rem] p-3 relative overflow-hidden h-[520px]">
            <div className="absolute inset-3 rounded-[2rem] overflow-hidden cross-bg-dark">
              <Molecule3D />
            </div>

            <div className="absolute top-8 right-8 glass-dark text-white/90 rounded-full px-4 py-2 text-xs font-bold float-slow">{s.heroPanelTag1 || 'DNA · Genome'}</div>
            <div className="absolute top-24 left-8 glass-dark text-white/90 rounded-full px-4 py-2 text-xs font-bold float-slower">{s.heroPanelTag2 || 'ECG · Live'}</div>
            <div className="absolute bottom-40 right-10 glass-dark text-white/90 rounded-full px-4 py-2 text-xs font-bold float-slow" style={{ animationDelay: '2s' }}>{s.heroPanelTag3 || 'Research'}</div>

            <div className="absolute bottom-6 inset-x-6 glass-dark rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-tealbright">
                  <span className="w-2 h-2 rounded-full bg-tealbright live-dot" /> {s.heroPanelLiveLabel || 'LIVE UPDATE'}
                </span>
                <span className="text-[11px] font-bold text-white/40">{s.heroPanelLiveFromLabel || 'من الميدان الطبي'}</span>
              </div>
              <svg viewBox="0 0 240 60" className="w-full h-10 my-2" preserveAspectRatio="none">
                <path className="ecg-path" d="M0 30 H60 l8-18 10 36 8-28 6 10 H150 l8-14 8 22 6-8 H240"
                  fill="none" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-sm font-bold text-white/80 truncate">
                {nextUp ? `المؤتمر الجاي: ${nextUp.title} — ${nextUp.date || ''}` : (s.heroPanelDefaultMsg || 'تابع أحدث المؤتمرات والأبحاث أول بأول')}
              </p>
            </div>
          </div>
          </Tilt>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- الجملة الوسطى ---------- */
export function Statement() {
  const { s, typo } = useSite()
  const words = (s.statement || 'العلم مش بس شهادة — ده رحلة بتتعاش كل يوم.').split(' ')
  const boldFrom = Math.max(0, words.length - 4)
  const fs = (v) => `calc(${v}rem * ${typo.scale})`
  return (
    <section className="py-16 px-6 text-center relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-royal/5 blur-3xl -translate-y-1/2" />
      <Cross className="absolute top-10 left-12 w-8 h-8 text-teal/15 spin-slower" />
      <svg viewBox="0 0 240 60" className="w-56 h-8 mx-auto mb-8 opacity-70" preserveAspectRatio="none">
        <path className="ecg-divider" d="M0 30 H60 l8-18 10 36 8-28 6 10 H150 l8-14 8 22 6-8 H240"
          fill="none" stroke="#0f9d8f" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <h2 className="relative font-bold leading-snug max-w-4xl mx-auto" style={{ fontSize: fs(typo.statement) }}>
        {words.map((w, i) => (
          <motion.span key={i}
            initial={{ opacity: .12 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-120px' }}
            transition={{ delay: i * .06, duration: .5 }}
            className={i >= boldFrom ? 'gradient-text font-black' : ''}>
            {w}{' '}
          </motion.span>
        ))}
      </h2>
    </section>
  )
}
