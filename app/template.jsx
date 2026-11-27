'use client'

import { motion } from 'framer-motion'

// انتقال ناعم بين الصفحات
export default function Template({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .6, ease: [.22, 1, .36, 1] }}
    >
      {children}
    </motion.div>
  )
}
