'use client'

import { useEffect, useState } from 'react'
import { firebaseReady, auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, query, orderBy } from 'firebase/firestore'
import { DEMO } from '@/lib/data'

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
    } catch (err) {
      console.error('Save error:', err)
      let m = err?.message || 'خطأ غير معروف'
      if (m.includes('permission-denied') || m.includes('PERMISSION_DENIED')) {
        m = '🚫 Firestore رفض الكتابة. لازم تنشر قواعد Firestore من Firebase Console → Firestore → Rules.'
      }
      alert(m)
    }
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
    try {
      await deleteDoc(doc(db, name, id))
    } catch (err) {
      alert('مفيش صلاحية للحذف. اتأكد إن Firestore Rules بتسمح بالكتابة للمستخدم المسجّل. الخطأ: ' + err.message)
    }
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

/* ============ مكونات الإدخال المساعدة ============ */
function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-ink/60 mb-1.5">{label}</label>
      {children}
      {hint && <div className="text-[11px] text-ink/40 mt-1">{hint}</div>}
    </div>
  )
}

function TextLike({ value, onChange, textarea, rows = 3, dir = 'auto', ph }) {
  if (textarea) {
    return <textarea rows={rows} dir={dir} placeholder={ph} className={inCls} value={value || ''} onChange={(e) => onChange(e.target.value)} />
  }
  return <input type="text" dir={dir} placeholder={ph} className={inCls} value={value || ''} onChange={(e) => onChange(e.target.value)} />
}

/* ============ تبويب تعديل كل النصوص ============ */
function TextsTab({ data, set }) {
  // بيانات الناف بار كنص مفصول بـ |
  const navLinksStr = (data.navLinks || []).map((row) => row.join('|')).join('\n')
  function setNavLinks(v) {
    const arr = v.split('\n').map((line) => {
      const [h = '#', t = ''] = line.split('|').map((s) => s.trim())
      return [h, t]
    }).filter((r) => r[1])
    set('navLinks', arr)
  }

  return (
    <div className="max-w-3xl space-y-6">

      {/* الهيدر */}
      <div className="glass rounded-[2rem] p-7 space-y-4">
        <h3 className="font-serif text-2xl font-bold">الهيدر (الناف بار)</h3>
        <Field label="اسم البراند (اللي فوق شمال)">
          <TextLike value={data.brand} onChange={(v) => set('brand', v)} />
        </Field>
        <Field label="السطر اللي تحت البراند (إنجليزي)">
          <TextLike value={data.brandSubtitle} onChange={(v) => set('brandSubtitle', v)} dir="ltr" />
        </Field>
        <Field label="روابط الناف بار" hint="كل سطر بصيغة: الرابط|النص — مثال: #conferences|المؤتمرات">
          <textarea rows={4} dir="ltr" className={inCls} value={navLinksStr} onChange={(e) => setNavLinks(e.target.value)} />
        </Field>
        <Field label="نص زر الفيسبوك في الناف بار">
          <TextLike value={data.navFacebookCta} onChange={(v) => set('navFacebookCta', v)} />
        </Field>
      </div>

      {/* الهيرو */}
      <div className="glass rounded-[2rem] p-7 space-y-4">
        <h3 className="font-serif text-2xl font-bold">القسم الرئيسي (Hero)</h3>
        <Field label="النص الصغير فوق العنوان (Eyebrow)">
          <TextLike value={data.heroEyebrow} onChange={(v) => set('heroEyebrow', v)} />
        </Field>
        <Field label="العنوان الرئيسي (كل سطر لوحده)">
          <TextLike textarea value={data.heroTitle} onChange={(v) => set('heroTitle', v)} />
        </Field>
        <Field label="الوصف اللي تحت العنوان">
          <TextLike textarea value={data.heroSub} onChange={(v) => set('heroSub', v)} />
        </Field>
        <Field label="صورتك الشخصية (رابط URL)">
          <TextLike value={data.heroImage} onChange={(v) => set('heroImage', v)} dir="ltr" ph="https://example.com/my-photo.jpg" />
        </Field>
        <Field label="نص الزر الأساسي">
          <TextLike value={data.heroBtnPrimary} onChange={(v) => set('heroBtnPrimary', v)} />
        </Field>
        <Field label="نص الزر الثانوي">
          <TextLike value={data.heroBtnSecondary} onChange={(v) => set('heroBtnSecondary', v)} />
        </Field>
      </div>

      {/* لوحة الهيرو */}
      <div className="glass rounded-[2rem] p-7 space-y-4">
        <h3 className="font-serif text-2xl font-bold">لوحة الهيرو الجانبية</h3>
        <Field label="نص التاج الأول (DNA · Genome)">
          <TextLike value={data.heroPanelTag1} onChange={(v) => set('heroPanelTag1', v)} dir="ltr" />
        </Field>
        <Field label="نص التاج الثاني (ECG · Live)">
          <TextLike value={data.heroPanelTag2} onChange={(v) => set('heroPanelTag2', v)} dir="ltr" />
        </Field>
        <Field label="نص التاج الثالث (Research)">
          <TextLike value={data.heroPanelTag3} onChange={(v) => set('heroPanelTag3', v)} dir="ltr" />
        </Field>
        <Field label="نص LIVE UPDATE">
          <TextLike value={data.heroPanelLiveLabel} onChange={(v) => set('heroPanelLiveLabel', v)} dir="ltr" />
        </Field>
        <Field label="النص اللي جمب LIVE (من الميدان الطبي)">
          <TextLike value={data.heroPanelLiveFromLabel} onChange={(v) => set('heroPanelLiveFromLabel', v)} />
        </Field>
        <Field label="رسالة افتراضية لو مفيش مؤتمر قادم">
          <TextLike value={data.heroPanelDefaultMsg} onChange={(v) => set('heroPanelDefaultMsg', v)} />
        </Field>
      </div>

      {/* قسم المؤتمرات */}
      <div className="glass rounded-[2rem] p-7 space-y-4">
        <h3 className="font-serif text-2xl font-bold">قسم المؤتمرات</h3>
        <Field label="النص الصغير فوق العنوان (Eyebrow)">
          <TextLike value={data.conferencesEyebrow} onChange={(v) => set('conferencesEyebrow', v)} dir="ltr" />
        </Field>
        <Field label="عنوان القسم (كل سطر لوحده)">
          <TextLike textarea value={data.conferencesTitle} onChange={(v) => set('conferencesTitle', v)} />
        </Field>
        <Field label="وصف القسم">
          <TextLike textarea value={data.conferencesSub} onChange={(v) => set('conferencesSub', v)} />
        </Field>
        <Field label="نص زر متابعة المؤتمر">
          <TextLike value={data.conferenceFollowCta} onChange={(v) => set('conferenceFollowCta', v)} />
        </Field>
      </div>

      {/* الجملة الوسطى */}
      <div className="glass rounded-[2rem] p-7 space-y-4">
        <h3 className="font-serif text-2xl font-bold">الجملة الوسطى</h3>
        <Field label="نص الجملة (آخر 4 كلمات بتيجي بلون مميز)" hint="اكتب جملة عربية متماسكة — آخر 4 كلمات هتظهر بشكل مميز">
          <TextLike textarea value={data.statement} onChange={(v) => set('statement', v)} />
        </Field>
      </div>

      {/* قسم الصور */}
      <div className="glass rounded-[2rem] p-7 space-y-4">
        <h3 className="font-serif text-2xl font-bold">قسم صور المؤتمرات</h3>
        <Field label="Eyebrow"><TextLike value={data.galleryEyebrow} onChange={(v) => set('galleryEyebrow', v)} dir="ltr" /></Field>
        <Field label="عنوان القسم (كل سطر لوحده)"><TextLike textarea value={data.galleryTitle} onChange={(v) => set('galleryTitle', v)} /></Field>
        <Field label="وصف القسم"><TextLike textarea value={data.gallerySub} onChange={(v) => set('gallerySub', v)} /></Field>
        <Field label="نص زر لينكدإن"><TextLike value={data.galleryLinkedInCta} onChange={(v) => set('galleryLinkedInCta', v)} /></Field>
      </div>

      {/* قسم الأبحاث */}
      <div className="glass rounded-[2rem] p-7 space-y-4">
        <h3 className="font-serif text-2xl font-bold">قسم الأبحاث</h3>
        <Field label="Eyebrow"><TextLike value={data.researchEyebrow} onChange={(v) => set('researchEyebrow', v)} dir="ltr" /></Field>
        <Field label="عنوان القسم (كل سطر لوحده)"><TextLike textarea value={data.researchTitle} onChange={(v) => set('researchTitle', v)} /></Field>
        <Field label="وصف القسم"><TextLike textarea value={data.researchSub} onChange={(v) => set('researchSub', v)} /></Field>
        <Field label="نص زر قراءة البحث"><TextLike value={data.researchReadCta} onChange={(v) => set('researchReadCta', v)} /></Field>
      </div>

      {/* قسم عنّي */}
      <div className="glass rounded-[2rem] p-7 space-y-4">
        <h3 className="font-serif text-2xl font-bold">قسم عنّي</h3>
        <Field label="Eyebrow"><TextLike value={data.aboutEyebrow} onChange={(v) => set('aboutEyebrow', v)} dir="ltr" /></Field>
        <Field label="عنوان القسم (كل سطر لوحده)"><TextLike textarea value={data.aboutTitle} onChange={(v) => set('aboutTitle', v)} /></Field>
        <Field label="نص عنّي"><TextLike textarea rows={5} value={data.about} onChange={(v) => set('about', v)} /></Field>
        <Field label="نص زر التواصل"><TextLike value={data.aboutContactCta} onChange={(v) => set('aboutContactCta', v)} /></Field>
        <Field label="إيميل التواصل (mailto)"><TextLike value={data.contactEmail} onChange={(v) => set('contactEmail', v)} dir="ltr" ph="contact@example.com" /></Field>
      </div>

      {/* الفوتر */}
      <div className="glass rounded-[2rem] p-7 space-y-4">
        <h3 className="font-serif text-2xl font-bold">الفوتر</h3>
        <Field label="الشعار اللي في النص"><TextLike value={data.footerTagline} onChange={(v) => set('footerTagline', v)} dir="ltr" /></Field>
        <Field label="نص حقوق النشر"><TextLike value={data.footerCopyright} onChange={(v) => set('footerCopyright', v)} /></Field>
      </div>

      {/* الشريط المتحرك */}
      <div className="glass rounded-[2rem] p-7 space-y-4">
        <h3 className="font-serif text-2xl font-bold">الشريط المتحرك</h3>
        <Field label="الكلمات (كل كلمة في سطر)">
          <textarea rows={6} className={inCls} value={(data.marquee || []).join('\n')} onChange={(e) => set('marquee', e.target.value.split('\n').filter(Boolean))} />
        </Field>
      </div>

    </div>
  )
}

/* ============ تبويب الأحجام (Typography) ============ */
function TypographyTab({ data, set }) {
  const typo = data.typography || {}
  const setT = (k, v) => set('typography', { ...typo, [k]: v })

  // الفرق بين القيمة الحالية والافتراضية
  const defaults = DEMO.settings.typography
  function resetAll() {
    if (!confirm('ترجيع كل الأحجام للوضع الافتراضي؟')) return
    set('typography', { ...defaults })
  }
  function resetOne(k) {
    setT(k, defaults[k])
  }

  const rows = [
    { k: 'scale', label: 'المضاعف العام (Scale)', min: 0.6, max: 1.5, step: 0.05, unit: '×', hint: 'بيأثر على كل الأحجام مع بعض' },
    { k: 'heroTitle', label: 'العنوان الرئيسي (ديسكتوب)', min: 3, max: 9, step: 0.1, unit: 'rem' },
    { k: 'heroTitleMobile', label: 'العنوان الرئيسي (موبايل)', min: 8, max: 22, step: 0.5, unit: 'vw' },
    { k: 'sectionTitle', label: 'عناوين الأقسام', min: 2, max: 6, step: 0.05, unit: 'rem' },
    { k: 'sectionSub', label: 'وصف الأقسام', min: 0.8, max: 1.6, step: 0.025, unit: 'rem' },
    { k: 'heroSub', label: 'وصف الهيرو', min: 0.8, max: 1.6, step: 0.025, unit: 'rem' },
    { k: 'cardTitle', label: 'عناوين الكروت', min: 1, max: 2.5, step: 0.05, unit: 'rem' },
    { k: 'cardBody', label: 'نصوص الكروت', min: 0.7, max: 1.3, step: 0.025, unit: 'rem' },
    { k: 'statsNumber', label: 'أرقام الإحصائيات', min: 1.2, max: 3.5, step: 0.05, unit: 'rem' },
    { k: 'statsLabel', label: 'تسميات الإحصائيات', min: 0.55, max: 1.1, step: 0.025, unit: 'rem' },
    { k: 'statement', label: 'الجملة الوسطى', min: 1.5, max: 5, step: 0.05, unit: 'rem' },
    { k: 'navLink', label: 'روابط الناف بار والأزرار', min: 0.7, max: 1.2, step: 0.025, unit: 'rem' },
    { k: 'eyebrow', label: 'النص الصغير فوق العناوين', min: 0.6, max: 1.1, step: 0.025, unit: 'rem' },
    { k: 'brandTitle', label: 'اسم البراند', min: 0.9, max: 1.6, step: 0.025, unit: 'rem' },
    { k: 'footerText', label: 'نص الفوتر', min: 0.6, max: 1, step: 0.025, unit: 'rem' },
  ]

  return (
    <div className="max-w-3xl space-y-6">
      <div className="glass rounded-[2rem] p-7 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-serif text-2xl font-bold">التحكم في الخطوط</h3>
          <button onClick={resetAll} className="text-xs font-bold bg-red-500/10 text-red-500 rounded-full px-4 py-2 hover:bg-red-500 hover:text-white transition-colors">ترجيع الكل افتراضي</button>
        </div>
        <p className="text-sm text-ink/60 leading-relaxed">
          ظبط الأحجام من هنا عشان تخلي الموقع متناسق. كل القيم بـ rem (1rem ≈ 16px).
          تقدر تستخدم <span className="font-bold text-royal">المضاعف العام</span> عشان تكبّر أو تصغّر كل الأحجام مع بعض في نفس الوقت.
        </p>

        {/* معاينة مباشرة */}
        <div className="bg-ice/60 rounded-2xl p-5 space-y-2 border border-ink/5">
          <div className="text-[10px] font-bold text-ink/40 tracking-widest">معاينة</div>
          <div className="font-serif font-bold" style={{ fontSize: `calc(${typo.heroTitle || defaults.heroTitle}rem * ${typo.scale || 1})` }}>طبّ. علم. إنسانية.</div>
          <div className="font-serif font-bold" style={{ fontSize: `calc(${typo.sectionTitle || defaults.sectionTitle}rem * ${typo.scale || 1})` }}>عنوان قسم</div>
          <div style={{ fontSize: `calc(${typo.cardBody || defaults.cardBody}rem * ${typo.scale || 1})` }} className="text-ink/60">نص الكارت اللي بيوضح المحتوى المكتوب</div>
          <div className="flex items-center gap-4 pt-2">
            <span className="font-serif font-bold text-navy" style={{ fontSize: `calc(${typo.statsNumber || defaults.statsNumber}rem * ${typo.scale || 1})` }}>12+</span>
            <span className="font-bold text-ink/50" style={{ fontSize: `calc(${typo.statsLabel || defaults.statsLabel}rem * ${typo.scale || 1})` }}>مؤتمر</span>
          </div>
        </div>
      </div>

      <div className="glass rounded-[2rem] p-7 space-y-5">
        {rows.map((r) => {
          const val = Number(typo[r.k] ?? defaults[r.k])
          const changed = Math.abs(val - defaults[r.k]) > 0.001
          return (
            <div key={r.k} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{r.label}</span>
                  {changed && (
                    <button onClick={() => resetOne(r.k)} className="text-[10px] font-bold bg-ink/5 text-ink/50 rounded-full px-2 py-0.5 hover:bg-royal/10 hover:text-royal transition-colors">↺ افتراضي</button>
                  )}
                </div>
                <span className="text-xs font-bold text-royal bg-royal/10 rounded-full px-3 py-1 tabular-nums">{val.toFixed(2)} {r.unit}</span>
              </div>
              <input type="range" min={r.min} max={r.max} step={r.step} value={val}
                onChange={(e) => setT(r.k, parseFloat(e.target.value))}
                className="w-full accent-[#1d4ed8]" />
              {r.hint && <div className="text-[11px] text-ink/40">{r.hint}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ============ تبويب الإعدادات (هيدر + إحصائيات + سوشيال) ============ */
function SettingsTab({ data, set }) {
  const socials = [
    ['facebook', 'فيسبوك'], ['linkedin', 'لينكدإن'], ['instagram', 'إنستجرام'],
    ['youtube', 'يوتيوب'], ['tiktok', 'تيك توك'],
  ]
  const stats = data.stats || []

  function addStat() {
    set('stats', [...stats, { value: 0, suffix: '+', label: 'إحصائية جديدة' }])
  }
  function removeStat(i) {
    set('stats', stats.filter((_, j) => j !== i))
  }
  function setStat(i, k, v) {
    const arr = [...stats]
    arr[i] = { ...arr[i], [k]: v }
    set('stats', arr)
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* الإحصائيات */}
      <div className="glass rounded-[2rem] p-7 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-serif text-2xl font-bold">الإحصائيات</h3>
          <button onClick={addStat} className="text-xs font-bold bg-royal/10 text-royal rounded-full px-4 py-2 hover:bg-royal hover:text-white transition-colors">+ إضافة إحصائية</button>
        </div>
        <p className="text-xs text-ink/50">عدّل القيم واللاحقة (+, K, إلخ) والتسمية. تقدر تضيف أو تمسح صفوف براحتك.</p>
        {stats.length === 0 && <div className="text-center text-sm font-bold text-ink/40 py-6">مفيش إحصائيات — ضيف أول واحدة</div>}
        {stats.map((st, i) => (
          <div key={i} className="grid grid-cols-[80px_70px_1fr_auto] gap-3 items-center">
            <input type="number" className={inCls} value={st.value} placeholder="رقم"
              onChange={(e) => setStat(i, 'value', e.target.value)} />
            <input className={inCls} value={st.suffix || ''} placeholder="+"
              onChange={(e) => setStat(i, 'suffix', e.target.value)} />
            <input className={inCls} value={st.label || ''} placeholder="التسمية"
              onChange={(e) => setStat(i, 'label', e.target.value)} />
            <button onClick={() => removeStat(i)} type="button" title="حذف"
              className="shrink-0 w-10 h-10 rounded-full bg-red-500/10 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-colors">×</button>
          </div>
        ))}
      </div>

      {/* السوشيال */}
      <div className="glass rounded-[2rem] p-7 space-y-4">
        <h3 className="font-serif text-2xl font-bold">لينكات السوشيال ميديا</h3>
        {socials.map(([k, label]) => (
          <Field key={k} label={label}>
            <input dir="ltr" type="url" className={inCls} placeholder="https://..."
              value={(data.socials && data.socials[k]) || ''}
              onChange={(e) => set('socials', { ...(data.socials || {}), [k]: e.target.value })} />
          </Field>
        ))}
      </div>
    </div>
  )
}

/* ============ تبويب موحّد لكل الإعدادات (Texts + Typography + Settings) ============ */
function UnifiedSettings() {
  const [data, setData] = useState(null)
  const [saved, setSaved] = useState(false)
  const [sub, setSub] = useState('texts') // texts | typography | settings
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [docExists, setDocExists] = useState(false)

  useEffect(() => {
    return onSnapshot(doc(db, 'site', 'settings'), (s) => {
      setDocExists(s.exists())
      setData(s.exists() ? { ...DEMO.settings, ...s.data(), typography: { ...DEMO.settings.typography, ...(s.data().typography || {}) } } : { ...DEMO.settings })
    }, (err) => {
      setError('مش قادر يقرأ من Firestore: ' + err.message)
    })
  }, [])

  if (!data) return <div className="glass rounded-3xl p-10 text-center font-bold text-ink/40">جاري التحميل...</div>

  const set = (k, v) => {
    setError('')
    setData((d) => ({ ...d, [k]: v }))
  }

  async function save() {
    if (saving) return
    setSaving(true); setError(''); setSaved(false)
    try {
      // محاولة الحفظ
      await setDoc(doc(db, 'site', 'settings'), data, { merge: true })
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Save error:', err)
      let msg = err?.message || 'خطأ غير معروف'
      if (msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
        msg = '🚫 Firestore رفض الكتابة. لازم تنشر قواعد Firestore (firestore.rules) من Firebase Console → Firestore → Rules. شوف التعليمات تحت.'
      } else if (msg.includes('unauthenticated') || msg.includes('UNAUTHENTICATED')) {
        msg = '🚫 مش مسجّل دخول. اعمل تسجيل خروج ودخول تاني.'
      }
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const subTabs = [
    ['texts', 'كل النصوص'],
    ['typography', 'الخطوط والأحجام'],
    ['settings', 'الإحصائيات والسوشيال'],
  ]

  return (
    <div className="space-y-6">
      {/* تبويبات فرعية */}
      <div className="glass rounded-2xl p-2 flex gap-2 flex-wrap sticky top-3 z-30">
        {subTabs.map(([k, t]) => (
          <button key={k} onClick={() => setSub(k)}
            className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${sub === k ? 'bg-ink text-white' : 'text-ink/60 hover:bg-ink/5'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* مؤشر حالة قاعدة البيانات */}
      <div className={`glass rounded-2xl px-5 py-3 flex items-center gap-3 text-xs font-bold ${docExists ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
        <span className={`w-2 h-2 rounded-full ${docExists ? 'bg-emerald-500' : 'bg-amber-500'} live-dot`} />
        {docExists ? 'متصل بقاعدة البيانات — التعديلات بتتحفظ على Firebase' : 'أول مرة تحفظ فيها هيتم إنشاء سجل الإعدادات على Firebase'}
      </div>

      {sub === 'texts' && <TextsTab data={data} set={set} />}
      {sub === 'typography' && <TypographyTab data={data} set={set} />}
      {sub === 'settings' && <SettingsTab data={data} set={set} />}

      {/* رسالة الخطأ */}
      {error && (
        <div className="glass rounded-2xl px-5 py-4 bg-red-50 border-2 border-red-200 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      <div className="sticky bottom-3 z-30">
        <button onClick={save} disabled={saving} className="w-full bg-ink text-white rounded-full py-4 font-bold shadow-lg shadow-ink/20 hover:bg-royal transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
          {saving ? '⏳ جاري الحفظ...' : saved ? '✅ تم الحفظ بنجاح' : '💾 حفظ كل التعديلات'}
        </button>
      </div>
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

  const tabs = [
    ['conferences', 'المؤتمرات'],
    ['gallery', 'صور المؤتمرات'],
    ['research', 'الأبحاث'],
    ['settings', 'النصوص والخطوط'],
  ]

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
        {tab === 'settings' ? <UnifiedSettings /> : <Crud name={tab} />}
      </main>
    </div>
  )
}
