import './globals.css'
import { Playfair_Display, Cairo } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo' })

export const metadata = {
  title: 'د. | طب — مؤتمرات — أبحاث',
  description: 'موقع شخصي لطالب طب بشري وصانع محتوى: المؤتمرات، الصور، والأبحاث المنشورة.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${playfair.variable} ${cairo.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('dr-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}` }} />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
