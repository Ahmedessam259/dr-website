'use client'

import { useEffect, useState } from 'react'
import { db, firebaseReady } from './firebase'
import { doc, onSnapshot, collection } from 'firebase/firestore'

// بيانات تجريبية بتظهر لحد ما تضيف بياناتك من الداش بورد
// كل النصوص اللي في الموقع موجودة في settings.texts عشان تقدر تعدلها كلها من الادمن
// وكل أحجام الخطوط في settings.typography
export const DEMO = {
  settings: {
    brand: 'د. طبيب',
    brandSubtitle: 'MEDICINE · CREATOR',

    // ======== الهيرو ========
    heroEyebrow: 'طب بشري · صانع محتوى · باحث',
    heroTitle: 'طبّ.\nعلم.\nإنسانية.',
    heroImage: '',
    heroSub: 'طالب طب بشري وصانع محتوى — بأخدك معايا في رحلة المؤتمرات والأبحاث والتجارب الطبية خطوة بخطوة، من غير تعقيد ومن قلب الكلية.',
    heroBtnPrimary: 'المؤتمرات القادمة',
    heroBtnSecondary: 'الأبحاث المنشورة',

    // لوحة الهيرو الجانبية
    heroPanelTag1: 'DNA · Genome',
    heroPanelTag2: 'ECG · Live',
    heroPanelTag3: 'Research',
    heroPanelLiveLabel: 'LIVE UPDATE',
    heroPanelLiveFromLabel: 'من الميدان الطبي',
    heroPanelDefaultMsg: 'تابع أحدث المؤتمرات والأبحاث أول بأول',

    // زر الناف بار
    navFacebookCta: 'تابعني على فيسبوك',

    // روابط الناف بار
    navLinks: [
      ['#conferences', 'المؤتمرات'],
      ['#gallery', 'صور المؤتمرات'],
      ['#research', 'الأبحاث'],
      ['#about', 'عنّي'],
    ],

    // ======== قسم المؤتمرات ========
    conferencesEyebrow: 'CONFERENCES',
    conferencesTitle: 'المؤتمرات\nالقادمة',
    conferencesSub: 'هنا بتعرف على كل المؤتمرات الطبية اللي بشارك فيها — اعمل فولو لصفحة المؤتمر على فيسبوك وتابع كل التفاصيل أول بأول.',
    conferenceFollowCta: 'تابع المؤتمر على فيسبوك',

    // ======== الجملة الوسطى ========
    statement: 'العلم مش بس شهادة — ده رحلة بتتعاش كل يوم.',

    // ======== قسم الصور ========
    galleryEyebrow: 'GALLERY',
    galleryTitle: 'صور\nالمؤتمرات',
    gallerySub: 'لقطات من المؤتمرات اللي حضرتها — وألبومات مربوطة مباشرة بلينكدإن.',
    galleryLinkedInCta: 'لينكدإن',

    // ======== قسم الأبحاث ========
    researchEyebrow: 'RESEARCH',
    researchTitle: 'أبحاثي\nالمنشورة',
    researchSub: 'كل ورقة بحثية نشرتها — اضغط عشان تقرأها على لينكدإن أو المجلة.',
    researchReadCta: 'اقرأ البحث',

    // ======== قسم عنّي ========
    aboutEyebrow: 'ABOUT',
    aboutTitle: 'اعرف\nعنّي أكتر',
    about: 'أنا طالب في كلية الطب البشري وصانع محتوى طبي. بحضر المؤتمرات وبشارك صور وتجارب، وبنشر أبحاثي أول بأول. الهدف: علم مبسط يوصل لكل زمايلي في كل مكان.',
    aboutContactCta: 'تواصل معايا',
    contactEmail: 'contact@example.com',

    // ======== الفوتر ========
    footerTagline: 'MEDICINE · SCIENCE · HUMANITY',
    footerCopyright: '© 2026 — كل الحقوق محفوظة',

    // ======== الشريط المتحرك ========
    marquee: ['مؤتمرات طبية', 'أبحاث منشورة', 'محتوى علمي مبسط', 'ورش عمل', 'طب بشري', 'تعليم طبي'],

    // ======== الإحصائيات ========
    stats: [
      { value: 12, suffix: '+', label: 'مؤتمر وحدة طبية' },
      { value: 6, suffix: '+', label: 'بحث منشور' },
      { value: 40, suffix: 'K', label: 'متابع عبر المنصات' },
      { value: 3, suffix: '', label: 'سنوات في المجال' },
    ],

    socials: { facebook: '#', linkedin: '#', instagram: '#', youtube: '#', tiktok: '#' },

    // ======== الخطوط (Typography) ========
    // scale = مضاعف عام لكل الأحجام (0.7 = صغير، 1.0 = افتراضي، 1.3 = كبير)
    // كل القيم بـ rem
    typography: {
      scale: 1,
      brandTitle: 1.125,        // اسم البراند في الناف بار
      navLink: 0.875,           // روابط الناف بار
      eyebrow: 0.78,            // النص الصغير فوق العناوين
      heroTitle: 6.2,           // العنوان الرئيسي (ديسكتوب)
      heroTitleMobile: 15,      // العنوان الرئيسي (موبايل) vw
      heroSub: 1.125,           // الوصف تحت الهيرو
      sectionTitle: 3.75,       // عناوين الأقسام (text-6xl)
      sectionSub: 1.125,        // وصف الأقسام
      cardTitle: 1.5,           // عناوين الكروت (مؤتمر/بحث)
      cardBody: 0.875,          // نصوص الكروت
      statsNumber: 1.875,       // أرقام الإحصائيات
      statsLabel: 0.7,          // تسميات الإحصائيات
      statement: 3,             // الجملة الوسطى
      footerText: 0.75,         // نص الفوتر
    },
  },
  conferences: [
    {
      title: 'المؤتمر الدولي للطب البشري — طبعة 2026',
      date: '15 – 17 ديسمبر 2026', location: 'القاهرة، مصر',
      desc: 'أكبر تجمع طلابي طبي في المنطقة: محاضرات، ورش عمل، ومعارض للأجهزة الطبية.',
      fbLink: '#', image: '/demo/c1.svg', status: 'upcoming',
    },
    {
      title: 'ورشة البحث العلمي ونشر الأوراق البحثية',
      date: '2 نوفمبر 2026', location: 'أونلاين',
      desc: 'ورشة عملية: من فكرة البحث لحد النشر في مجلة محكمة.',
      fbLink: '#', image: '/demo/c2.svg', status: 'upcoming',
    },
    {
      title: 'مؤتمر طب المجتمع السنوي',
      date: 'مارس 2026', location: 'الإسكندرية',
      desc: 'مؤتمر سنوي عن الصحة المجتمعية والوقاية.',
      fbLink: '#', image: '/demo/c3.svg', status: 'past',
    },
  ],
  gallery: [
    {
      title: 'المؤتمر الدولي 2025', event: 'CIMS 2025',
      images: ['/demo/g1.svg', '/demo/g2.svg', '/demo/g3.svg'], link: '#',
    },
    {
      title: 'معسكر الأبحاث الصيفي', event: 'Research Camp',
      images: ['/demo/g4.svg', '/demo/g2.svg'], link: '',
    },
  ],
  research: [
    {
      title: 'تأثير نمط الحياة على صحة طلاب كليات الطب',
      authors: 'فريق البحث — كلية الطب البشري',
      journal: 'مجلة البحوث الطبية الطلابية', year: '2026',
      abstract: 'دراسة مقطعية على 500 طالب لقياس العلاقة بين النوم والنشاط البدني والأداء الأكاديمي.',
      link: '#', image: '/demo/r1.svg',
    },
    {
      title: 'مراجعة منهجية لأساليب التعلم الطبي الحديث',
      authors: 'فريق البحث — كلية الطب البشري',
      journal: 'مؤتمر التعليم الطبي الدولي', year: '2025',
      abstract: 'مراجعة لأحدث أساليب التعلم (PBL, CBL) وتأثيرها على استيعاب الطلاب للعلوم الأساسية.',
      link: '#', image: '/demo/r2.svg',
    },
    {
      title: 'وعي المجتمع بمضادات الميكروبات',
      authors: 'فريق البحث — كلية الطب البشري',
      journal: 'المجلة الطبية الإقليمية', year: '2025',
      abstract: 'استبيان ميداني لقياس مدى وعي الجمهور بخطورة سوء استخدام المضادات الحيوية.',
      link: '#', image: '/demo/r3.svg',
    },
  ],
}

export function useSettings() {
  const [settings, setSettings] = useState(DEMO.settings)
  useEffect(() => {
    if (!firebaseReady) return
    return onSnapshot(doc(db, 'site', 'settings'), (s) => {
      if (s.exists()) setSettings({ ...DEMO.settings, ...s.data(), typography: { ...DEMO.settings.typography, ...(s.data().typography || {}) } })
    })
  }, [])
  return settings
}

export function useCollection(name) {
  const [items, setItems] = useState(DEMO[name] || [])
  useEffect(() => {
    if (!firebaseReady) return
    return onSnapshot(collection(db, name), (snap) => {
      const live = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setItems(live.length ? live : (DEMO[name] || []))
    })
  }, [name])
  return items
}
