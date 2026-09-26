'use client'

import { useEffect, useState } from 'react'
import { firebaseReady, auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, query, orderBy } from 'firebase/firestore'

const inCls = 'w-full rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm outline-none focus:border-royal transition'

const CONFIGS = {
  conferences: {
    title: 'المؤتمرات', singular: 'مؤتمر',
    fields: [
      { key: 'title', label: 'اسم المؤتمر', type: 'text', required: true, ph: 'مثال: المؤتمر الدولي للطب البشري' },
      { key: 'date', label: 'التاريخ', type: 'text', ph: 'مثال: 15 – 17 ديسمبر 2026' },
      { key: 'location', label: 'المكان', type: 'text', ph: 'مثال: القاهرة / أونلاين' },
      { key: 'desc', label: 'وصف قصير', type: 'textarea' },
      { key: 'fbLink', label: 'لينك متابعة الفيسبوك', type: 'url', ph: 'https://facebook.com/...' },
      { key: 'image', label: 'صورة المؤتمر', type: 'image' },
      { key: 'status', label: 'الحالة', type: 'select', options: [['upcoming', 'قادم'], ['past', 'سابق']] },
    ],
  },
  gallery: {
    title: 'صور المؤتمرات', singular: 'ألبوم',
    fields: [
      { key: 'title', label: 'عنوان الألبوم', type: 'text', required: true },
      { key: 'event', label: 'اسم المؤتمر', type: 'text' },
      { key: 'images', label: 'الصور (ارفع أكتر من صورة)', type: 'images' },
      { key: 'link', label: 'رابط لينكدإن للألبوم (اختياري)', type: 'url', ph: 'https://linkedin.com/posts/...' },
    ],
  },
  research: {
    title: 'الأبحاث', singular: 'بحث',
    fields: [
      { key: 'title', label: 'عنوان البحث', type: 'text', required: true },
      { key: 'authors', label: 'الباحثون', type: 'text', ph: 'مثال: فريق البحث — كلية الطب' },
      { key: 'journal', label: 'المجلة / المؤتمر', type: 'text' },
      { key: 'year', label: 'السنة', type: 'text', ph: '2026' },
      { key: 'abstract', label: 'ملخص البحث', type: 'textarea' },
      { key: 'link', label: 'رابط لينكدإن / DOI', type: 'url', ph: 'https://linkedin.com/posts/...' },
      { key: 'image', label: 'صورة توضيحية', type: 'image' },
    ],
  },
}

/* ---------- رفع الصور على Cloudinary ---------- */
function UploadBox({ value, onChange, multiple }) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  async function handle(files) {
    if (!cloud || !preset) { alert('لازم تضيف CLOUDINARY في ملف .env.local الأول (شوف ملف README)'); return }
    setBusy(true); setProgress(0)
    const uploaded = []
    let done = 0
    for (const f of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', f)
      fd.append('upload_preset', preset)
      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: fd })
        const data = await res.json()
        if (data.secure_url) uploaded.push(data.secure_url)
        else alert('فيه مشكلة في الرفع: ' + (data.error?.message || 'غير معروف'))
      } catch (e) { alert('فيه مشكلة في الرفع، اتأكد من النت') }
      done++; setProgress(Math.round((done / files.length) * 100))
    }
    setBusy(false)
    if (multiple) onChange([...(value || []), ...uploaded])
    else onChange(uploaded[0] || value)
  }

  const urls = multiple ? (value || []) : (value ? [value] : [])

  return (
    <div>
      <label className={`block border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${busy ? 'border-royal bg-royal/5' : 'border-ink/15 hover:border-royal/50'}`}>
        <input type="file" accept="image/*" multiple={multiple} className="hidden" disabled={busy}
          onChange={(e) => { if (e.target.files?.length) handle(e.target.files); e.target.value = '' }} />
        {busy
          ? <div className="text-sm font-bold text-royal">جاري الرفع... {progress}%</div>
          : <div className="text-sm font-bold text-ink/60">اضغط هنا عشان ترفع {multiple ? 'الصور' : 'صورة'}<div className="text-[11px] text-ink/40 mt-1">مجاني تماماً عبر Cloudinary</div></div>}
      </label>
      {busy && <div className="h-1.5 bg-ink/10 rounded-full mt-3 overflow-hidden"><div className="h-full bg-royal transition-all" style={{ width: progress + '%' }} /></div>}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {urls.map((u, i) => (
            <div key={i} className="relative group">
              <img src={u} className="w-16 h-16 rounded-xl object-cover border border-ink/10" alt="" />
              <button type="button" onClick={() => onChange(multiple ? urls.filter((_, j) => j !== i) : '')}
                className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- مدير إضافة/تعديل/حذف ---------- */
function Crud({ name }) {
  const cfg = CONFIGS[name]
  const empty = { status: 'upcoming' }
  cfg.fields.forEach((f) => { if (f.type === 'images') empty[f.key] = [] })
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    return onSnapshot(query(collection(db, name), orderBy('createdAt', 'desc')), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
  }, [name])

  function set(key, v) { setForm((f) => ({ ...f, [key]: v })) }

  async function save(e) {
    e.preventDefault()
    const required = cfg.fields.find((f) => f.required && !String(form[f.key] || '').trim())
    if (required) { alert(`حقل "${required.label}" مطلوب`); return }
    setSaving(true); setMsg('')
    try {
      const payload = { ...form }
      if (editingId) await updateDoc(doc(db, name, editingId), payload)
      else await addDoc(collection(db, name), { ...payload, createdAt: Date.now() })
      setForm(empty); setEditingId(null)
      setMsg(editingId ? 'تم التعديل بنجاح ✅' : 'تمت الإضافة بنجاح ✅')
    } catch (err) { alert('حصل خطأ: ' + err.message) }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  function edit(item) {
    setForm({ ...empty, ...item })
    setEditingId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function remove(id) {
    if (!confirm('متأكد إنك عايز تمسح العنصر ده؟')) return
    await deleteDoc(doc(db, name, id))
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 items-start">
      {/* الفورم */}
      <form onSubmit={save} className="glass rounded-[2rem] p-7 space-y-4 lg:sticky lg:top-6">
        <h3 className="font-serif text-2xl font-bold">{editingId ? `تعديل ${cfg.singular}` : `إضافة ${cfg.singular} جديد`}</h3>
        {cfg.fields.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-bold text-ink/60 mb-1.5">{f.label} {f.required && <span className="text-royal">*</span>}</label>
            {(f.type === 'text' || f.type === 'url') && (
              <input dir={f.type === 'url' ? 'ltr' : 'auto'} type={f.type === 'url' ? 'url' : 'text'} placeholder={f.ph || ''}
                className={inCls} value={form[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} />
            )}
            {f.type === 'textarea' && (
              <textarea rows={3} className={inCls} value={form[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} />
            )}
            {f.type === 'select' && (
              <select className={inCls} value={form[f.key] || 'upcoming'} onChange={(e) => set(f.key, e.target.value)}>
                {f.options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
              </select>
            )}
            {(f.type === 'image' || f.type === 'images') && (
              <UploadBox value={form[f.key]} multiple={f.type === 'images'} onChange={(v) => set(f.key, v)} />
            )}
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button disabled={saving} className="flex-1 bg-ink text-white rounded-full py-3.5 font-bold text-sm hover:bg-royal transition-colors disabled:opacity-50">
            {saving ? 'جاري الحفظ...' : editingId ? 'حفظ التعديلات' : 'إضافة'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setForm(empty); setEditingId(null) }}
              className="px-6 rounded-full border-2 border-ink/15 font-bold text-sm hover:border-red-400 hover:text-red-500 transition-colors">إلغاء</button>
          )}
        </div>
        {msg && <div className="text-center text-sm font-bold text-emerald-600">{msg}</div>}
      </form>

      {/* القايمة */}
      <div className="space-y-4">
        {items.length === 0 && <div className="glass rounded-3xl p-10 text-center text-ink/40 font-bold">لسه مفيش عناصر — ضيف أول واحد من الفورم</div>}
        {items.map((it) => (
          <div key={it.id} className="glass rounded-3xl p-5 flex items-center gap-4 hover-lift">
            {(it.image || (it.images || [])[0]) && (
              <img src={it.image || it.images[0]} className="w-16 h-16 rounded-2xl object-cover shrink-0" alt="" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{it.title}</div>
              <div className="text-xs text-ink/45 font-bold mt-1 truncate">
                {[it.date, it.location, it.journal, it.year, it.event].filter(Boolean).join(' · ')}
              </div>
            </div>
            <button onClick={() => edit(it)} className="shrink-0 w-10 h-10 rounded-full bg-royal/10 text-royal font-bold hover:bg-royal hover:text-white transition-colors">✎</button>
            <button onClick={() => remove(it.id)} className="shrink-0 w-10 h-10 rounded-full bg-red-500/10 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-colors">×</button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- إعدادات الموقع ---------- */
function SettingsTab() {
  const [data, setData] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    return onSnapshot(doc(db, 'site', 'settings'), (s) => {
      setData(s.exists() ? s.data() : { stats: [], socials: {}, marquee: [] })
    })
  }, [])

  if (!data) return <div className="glass rounded-3xl p-10 text-center font-bold text-ink/40">جاري التحميل...</div>

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }))
  const socials = [
    ['facebook', 'فيسبوك'], ['linkedin', 'لينكدإن'], ['instagram', 'إنستجرام'],
    ['youtube', 'يوتيوب'], ['tiktok', 'تيك توك'],
  ]

  async function save() {
    await setDoc(doc(db, 'site', 'settings'), data, { merge: true })
    setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="glass rounded-[2rem] p-7 space-y-4">
        <h3 className="font-serif text-2xl font-bold">هيدر الصفحة الرئيسية</h3>
        <div>
          <label className="block text-xs font-bold text-ink/60 mb-1.5">اسم البراند (اللي فوق في الموقع)</label>
          <input className={inCls} value={data.brand || ''} onChange={(e) => set('brand', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-ink/60 mb-1.5">العنوان الرئيسي (كل سطر لوحده)</label>
          <textarea rows={3} className={inCls} value={data.heroTitle || ''} onChange={(e) => set('heroTitle', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-ink/60 mb-1.5">الوصف اللي تحت العنوان</label>
          <textarea rows={3} className={inCls} value={data.heroSub || ''} onChange={(e) => set('heroSub', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-ink/60 mb-1.5">نص "عنّي"</label>
          <textarea rows={4} className={inCls} value={data.about || ''} onChange={(e) => set('about', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-ink/60 mb-1.5">الشريط المتحرك (كل عنصر في سطر)</label>
          <textarea rows={4} className={inCls} value={(data.marquee || []).join('\n')} onChange={(e) => set('marquee', e.target.value.split('\n'))} />
        </div>
      </div>

      <div className="glass rounded-[2rem] p-7 space-y-4">
        <h3 className="font-serif text-2xl font-bold">الإحصائيات</h3>
        {(data.stats || []).map((st, i) => (
          <div key={i} className="grid grid-cols-[80px_70px_1fr] gap-3">
            <input type="number" className={inCls} value={st.value} placeholder="رقم"
              onChange={(e) => { const arr = [...data.stats]; arr[i] = { ...st, value: e.target.value }; set('stats', arr) }} />
            <input className={inCls} value={st.suffix || ''} placeholder="+"
              onChange={(e) => { const arr = [...data.stats]; arr[i] = { ...st, suffix: e.target.value }; set('stats', arr) }} />
            <input className={inCls} value={st.label || ''} placeholder="التسمية"
              onChange={(e) => { const arr = [...data.stats]; arr[i] = { ...st, label: e.target.value }; set('stats', arr) }} />
          </div>
        ))}
      </div>

      <div className="glass rounded-[2rem] p-7 space-y-4">
        <h3 className="font-serif text-2xl font-bold">لينكات السوشيال ميديا</h3>
        {socials.map(([k, label]) => (
          <div key={k}>
            <label className="block text-xs font-bold text-ink/60 mb-1.5">{label}</label>
            <input dir="ltr" type="url" className={inCls} placeholder="https://..."
              value={(data.socials && data.socials[k]) || ''}
              onChange={(e) => set('socials', { ...(data.socials || {}), [k]: e.target.value })} />
          </div>
        ))}
      </div>

      <button onClick={save} className="w-full bg-ink text-white rounded-full py-4 font-bold hover:bg-royal transition-colors">
        {saved ? 'تم الحفظ ✅' : 'حفظ كل الإعدادات'}
      </button>
    </div>
  )
}

/* ---------- شاشة تسجيل الدخول ---------- */
function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      await signInWithEmailAndPassword(auth, email, pass)
      onLogin && onLogin()
    } catch (e2) {
      setErr('الإيميل أو الباسورد غلط — أو الحساب مش موجود في Firebase')
    }
    setBusy(false)
  }

  return (
    <div className="min-h-screen grid place-items-center px-6 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-royal/10 blur-3xl" />
      <form onSubmit={submit} className="glass rounded-[2.5rem] p-10 w-full max-w-md relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-royal to-navy grid place-items-center text-white mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" /></svg>
        </div>
        <h1 className="font-serif text-3xl font-bold">داش بورد الإدارة</h1>
        <p className="text-sm text-ink/50 font-bold mt-2 mb-8">دخول خاص بيك انت بس</p>
        <div className="space-y-4">
          <input dir="ltr" type="email" required placeholder="الإيميل" className={inCls} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input dir="ltr" type="password" required placeholder="الباسورد" className={inCls} value={pass} onChange={(e) => setPass(e.target.value)} />
        </div>
        {err && <div className="text-sm font-bold text-red-500 mt-4">{err}</div>}
        <button disabled={busy} className="w-full mt-6 bg-ink text-white rounded-full py-4 font-bold hover:bg-royal transition-colors disabled:opacity-50">
          {busy ? 'جاري الدخول...' : 'دخول'}
        </button>
      </form>
    </div>
  )
}

/* ---------- الصفحة ---------- */
export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [init, setInit] = useState(false)
  const [tab, setTab] = useState('conferences')

  useEffect(() => {
    if (!firebaseReady) { setInit(true); return }
    return onAuthStateChanged(auth, (u) => { setUser(u); setInit(true) })
  }, [])

  if (!init) return null

  if (!firebaseReady) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="glass rounded-[2rem] p-10 max-w-lg text-center">
          <h1 className="font-serif text-2xl font-bold mb-4">Firebase مش متوصل لسه</h1>
          <p className="text-sm text-ink/60 leading-relaxed font-bold">
            اعمل ملف <span dir="ltr" className="bg-ice px-2 py-0.5 rounded">.env.local</span> في فولدر المشروع
            وانسخ فيه القيم من <span dir="ltr" className="bg-ice px-2 py-0.5 rounded">.env.example</span>،
            وبعدين اعمل restart للسيرفر. خطوات التفصيل في ملف README.
          </p>
        </div>
      </div>
    )
  }

  if (!user) return <Login />

  const tabs = [['conferences', 'المؤتمرات'], ['gallery', 'صور المؤتمرات'], ['research', 'الأبحاث'], ['settings', 'إعدادات الموقع']]

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-royal to-navy grid place-items-center text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" /></svg>
            </div>
            <span className="font-serif font-bold text-lg">الداش بورد</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" className="text-xs font-bold bg-royal/10 text-royal rounded-full px-4 py-2 hover:bg-royal hover:text-white transition-colors">معاينة الموقع ↗</a>
            <button onClick={() => signOut(auth)} className="text-xs font-bold bg-red-500/10 text-red-500 rounded-full px-4 py-2 hover:bg-red-500 hover:text-white transition-colors">تسجيل خروج</button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-6 pb-3 flex gap-2 overflow-x-auto">
          {tabs.map(([k, t]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${tab === k ? 'bg-ink text-white' : 'bg-ink/5 text-ink/60 hover:bg-ink/10'}`}>
              {t}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {tab === 'settings' ? <SettingsTab /> : <Crud name={tab} />}
      </main>
    </div>
  )
}
