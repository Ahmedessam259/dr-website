'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettings, DEMO } from '@/lib/data'
import Tilt from './Tilt'
import Cursor from './Cursor'
import ScrollProgress from './ScrollProgress'

const ease = [.22, 1, .36, 1]

/* ---------- سياق الموقع: الإعدادات + الخطوط ---------- */
const SiteCtx = createContext(null)
export const useSite = () => useContext(SiteCtx)

/* ---------- أيقونات ---------- */
export const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5m0 0 6 6m-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Cross = ({ className = '' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" className={className}>
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
)

export const Pin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M12 21s-7-5.1-7-11a7 7 0 1 1 14 0c0 5.9-7 11-7 11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
  </svg>
)

export const ICONS = {
  facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  tiktok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
}

export function SocialIcon({ name, href, label, fontSize }) {
  return (
    <Tilt max={8} radius={16}>
    <a href={href || '#'} target="_blank" rel="noreferrer" aria-label={label}
      className="group flex items-center gap-3 glass card-frame rounded-2xl px-5 py-4 hover-lift">
      <span className="w-10 h-10 rounded-xl bg-ink text-white grid place-items-center group-hover:bg-gradient-to-br group-hover:from-royal group-hover:to-teal transition-all duration-500">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d={ICONS[name]} /></svg>
      </span>
      <span className="font-bold" style={{ fontSize: fontSize ? `${fontSize}rem` : undefined }}>{label}</span>
    </a>
    </Tilt>
  )
}

/* ---------- نص بيظهر سطر سطر ---------- */
export function Lines({ text, className = '' }) {
  const lines = String(text || '').split('\n')
  return (
    <span className={className}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-1">
          <span className="block line-rise" style={{ animationDelay: `${i * .14}s` }}>{l}</span>
        </span>
      ))}
    </span>
  )
}

/* ---------- عناوين الأقسام ---------- */
export function SectionHead({ eyebrow, title, sub }) {
  const { typo } = useSite()
  const fs = (v) => `calc(${v}rem * ${typo.scale})`
  return (
    <div className="max-w-3xl">
      <span className="eyebrow" style={{ fontSize: fs(typo.eyebrow) }}><span className="w-2 h-2 rounded-full bg-teal live-dot" />{eyebrow}</span>
      <h2 className="font-black mt-4 leading-tight" style={{ fontSize: fs(typo.sectionTitle) }}>
        <Lines text={title} />
      </h2>
      {sub && <p className="mt-5 text-ink/55 leading-relaxed" style={{ fontSize: fs(typo.sectionSub) }}>{sub}</p>}
    </div>
  )
}

/* ---------- تحويل لينكات الأقسام القديمة (#conferences) لصفحات حقيقية ---------- */
const ROUTE_MAP = {
  '#top': '/', '#': '/',
  '#conferences': '/conferences',
  '#gallery': '/gallery',
  '#research': '/research',
  '#about': '/about',
}
const toRoute = (url) => ROUTE_MAP[url] || url || '/'
const isInternal = (url) => url.startsWith('/')

/* ---------- شريط التنقل ---------- */
export function Navbar() {
  const { s, typo } = useSite()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 40)
    f(); window.addEventListener('scroll', f)
    return () => window.removeEventListener('scroll', f)
  }, [])

  // اقفل قائمة الموبايل لما نتنقل لصفحة تانية
  useEffect(() => { setOpen(false) }, [pathname])

  // بندعم الصيغتين: object {url,label} (الجديدة) أو array [url,label] (القديمة)
  const rawLinks = s.navLinks || []
  const links = rawLinks.map((row) => {
    if (Array.isArray(row)) return { url: row[0] || '#', label: row[1] || '' }
    return { url: row.url || '#', label: row.label || '' }
  })
  const fallback = [
    { url: '#conferences', label: 'المؤتمرات' },
    { url: '#gallery', label: 'صور المؤتمرات' },
    { url: '#research', label: 'الأبحاث' },
    { url: '#about', label: 'عنّي' },
  ]
  const finalLinks = (links.length ? links : fallback).map((l) => ({ ...l, url: toRoute(l.url) }))
  const fs = (v) => `calc(${v}rem * ${typo.scale})`

  const NavItem = ({ l, className = '' }) => {
    const active = isInternal(l.url) && pathname === l.url
    const cls = `nav-link transition-colors ${active ? 'text-royal' : 'text-ink/70 hover:text-royal'} ${className}`
    return isInternal(l.url)
      ? <Link href={l.url} className={cls} aria-current={active ? 'page' : undefined}>{l.label}</Link>
      : <a href={l.url} className={cls}>{l.label}</a>
  }

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled || open ? 'glass border-b border-ink/5' : 'bg-transparent'}`}>
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-royal to-teal text-white grid place-items-center shadow-lg shadow-royal/25">
            <Cross className="w-4 h-4" />
          </span>
          <div className="leading-tight">
            <div className="font-black" style={{ fontSize: fs(typo.brandTitle) }}>{s.brand || 'د. طبيب'}</div>
            <div className="text-[10px] tracking-[.32em] text-navy/60 font-bold">{s.brandSubtitle || 'MEDICINE · CREATOR'}</div>
          </div>
        </Link>

        {/* ديسكتوب */}
        <ul className="hidden md:flex items-center gap-8 font-bold" style={{ fontSize: fs(typo.navLink) }}>
          {finalLinks.map((l, i) => (<li key={l.url + i}><NavItem l={l} /></li>))}
        </ul>
        <a href={s.socials?.facebook || '#'} target="_blank" rel="noreferrer"
          className="btn-sheen hidden sm:inline-flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded-full font-bold hover:bg-royal transition-colors" style={{ fontSize: fs(typo.navLink) }}>
          {s.navFacebookCta || 'تابعني على فيسبوك'} <Arrow />
        </a>

        {/* زر قائمة الموبايل */}
        <button onClick={() => setOpen(!open)} aria-label="القائمة"
          className="md:hidden w-11 h-11 glass rounded-2xl grid place-items-center">
          <div className="space-y-1.5">
            <span className={`block w-5 h-0.5 bg-ink rounded transition-transform duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-ink rounded transition-opacity duration-300 ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-ink rounded transition-transform duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </nav>

      {/* قائمة الموبايل */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: .4, ease }}
            className="md:hidden overflow-hidden glass border-t border-ink/5"
          >
            <ul className="px-6 py-4 space-y-1 font-bold" style={{ fontSize: fs(typo.navLink) }}>
              <li><NavItem l={{ url: '/', label: 'الرئيسية' }} className="block py-3" /></li>
              {finalLinks.map((l, i) => (<li key={l.url + i}><NavItem l={l} className="block py-3" /></li>))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

/* ---------- الفوتر ---------- */
export function Footer() {
  const { s, typo } = useSite()
  const fs = (v) => `calc(${v}rem * ${typo.scale})`
  return (
    <footer className="border-t border-ink/10 py-10 px-6 relative">
      <svg viewBox="0 0 240 60" className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-6 bg-mist" preserveAspectRatio="none">
        <path className="ecg-divider" d="M0 30 H60 l8-18 10 36 8-28 6 10 H150 l8-14 8 22 6-8 H240"
          fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-royal to-teal text-white grid place-items-center"><Cross className="w-3.5 h-3.5" /></span>
          <div className="font-black" style={{ fontSize: fs(typo.brandTitle) }}>{s.brand || 'د. طبيب'}</div>
        </div>
        <div className="font-bold text-ink/40 tracking-widest" style={{ fontSize: fs(typo.footerText) }}>{s.footerTagline || 'MEDICINE · SCIENCE · HUMANITY'}</div>
        <div className="font-bold text-ink/40" style={{ fontSize: fs(typo.footerText) }}>{s.footerCopyright || '© 2026 — كل الحقوق محفوظة'}</div>
      </div>
    </footer>
  )
}

/* ---------- شاشة التحميل ---------- */
export function LoadingScreen() {
  return (
    <div className="min-h-screen grid place-items-center bg-ice/30 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-royal/10 blur-3xl" />
      <div className="relative z-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-royal to-teal text-white grid place-items-center mx-auto mb-5 pulse-ring">
          <Cross className="w-6 h-6 heartbeat" />
        </div>
        <p className="font-bold text-ink/50 text-sm">جاري التحميل...</p>
      </div>
    </div>
  )
}

/* ---------- الهيكل العام لكل صفحة ---------- */
export default function SiteShell({ children }) {
  const settings = useSettings()

  // لحد ما الإعدادات تيجي (من الكاش أو Firebase) نظهر شاشة تحميل بسيطة
  if (!settings) return <LoadingScreen />

  const typo = { ...DEMO.settings.typography, ...(settings.typography || {}) }

  return (
    <SiteCtx.Provider value={{ s: settings, typo }}>
      <div className="grain">
        <ScrollProgress />
        <Cursor />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    </SiteCtx.Provider>
  )
}
