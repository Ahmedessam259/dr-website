'use client'

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

export default function Counter({ to, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { duration: 2200, bounce: 0 })

  useEffect(() => { if (inView) mv.set(to) }, [inView, to, mv])
  useEffect(() => {
    const unsub = spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix
    })
    return unsub
  }, [spring, suffix])

  return <span ref={ref}>0{suffix}</span>
}
