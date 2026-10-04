'use client'

import { motion } from 'framer-motion'

const ease = [.22, 1, .36, 1]

export default function Reveal({ children, delay = 0, y = 44, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: .9, delay, ease }}
    >
      {children}
    </motion.div>
  )
}
