'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

// شريط تقدم القراءة فوق الصفحة (بيمتد من اليمين للشمال عشان RTL)
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 })
  return (
    <motion.div
      className="fixed top-0 right-0 left-0 h-[3px] z-[80] origin-right bg-gradient-to-l from-royal via-teal to-royal"
      style={{ scaleX }}
    />
  )
}
