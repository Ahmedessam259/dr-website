'use client'

import { useEffect, useState } from 'react'
import { db, firebaseReady } from './firebase'
import { doc, onSnapshot, collection } from 'firebase/firestore'

// بيانات تجريبية بتظهر لحد ما تضيف بياناتك من الداش بورد
export const DEMO = {
  settings: {
    brand: 'د. طبيب',
    heroTitle: 'طبّ.\nعلم.\nإنسانية.',
    heroImage: '',
    heroSub: 'طالب طب بشري وصانع محتوى — بأخدك معايا في رحلة المؤتمرات والأبحاث والتجارب الطبية خطوة بخطوة، من غير تعقيد ومن قلب الكلية.',
    about: 'أنا طالب في كلية الطب البشري وصانع محتوى طبي. بحضر المؤتمرات وبشارك صور وتجارب، وبنشر أبحاثي أول بأول. الهدف: علم مبسط يوصل لكل زمايلي في كل مكان.',
    marquee: ['مؤتمرات طبية', 'أبحاث منشورة', 'محتوى علمي مبسط', 'ورش عمل', 'طب بشري', 'تعليم طبي'],
    stats: [
      { value: 12, suffix: '+', label: 'مؤتمر وحدة طبية' },
      { value: 6, suffix: '+', label: 'بحث منشور' },
      { value: 40, suffix: 'K', label: 'متابع عبر المنصات' },
      { value: 3, suffix: '', label: 'سنوات في المجال' },
    ],
    socials: { facebook: '#', linkedin: '#', instagram: '#', youtube: '#', tiktok: '#' },
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
      if (s.exists()) setSettings({ ...DEMO.settings, ...s.data() })
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
