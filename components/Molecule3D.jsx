'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Line } from '@react-three/drei'

function DNA() {
  const g = useRef()
  const N = 30, R = 1.2, H = 4.6, turns = 2.4
  const up = [], dn = []
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1), a = t * Math.PI * 2 * turns
    up.push([Math.cos(a) * R, t * H - H / 2, Math.sin(a) * R])
    dn.push([Math.cos(a + Math.PI) * R, t * H - H / 2, Math.sin(a + Math.PI) * R])
  }

  useFrame((_, d) => { if (g.current) g.current.rotation.y += d * .35 })

  const rungs = []
  for (let i = 0; i < N; i += 3) rungs.push(i)

  return (
    <group ref={g} rotation={[.12, 0, .18]}>
      {up.map((p, i) => (
        <mesh key={'u' + i} position={p}>
          <sphereGeometry args={[.07, 16, 16]} />
          <meshStandardMaterial color="#1d4ed8" roughness={.3} metalness={.35} />
        </mesh>
      ))}
      {dn.map((p, i) => (
        <mesh key={'d' + i} position={p}>
          <sphereGeometry args={[.07, 16, 16]} />
          <meshStandardMaterial color="#0b1e3f" roughness={.3} metalness={.35} />
        </mesh>
      ))}
      {rungs.map((i) => (
        <Line key={'r' + i} points={[up[i], dn[i]]} color="#93c5fd" lineWidth={1.4} transparent opacity={.65} />
      ))}
    </group>
  )
}

export default function Molecule3D() {
  return (
    <Canvas camera={{ position: [0, 0, 6.4], fov: 45 }} gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
      <ambientLight intensity={.9} />
      <directionalLight position={[4, 6, 6]} intensity={1.15} />
      <pointLight position={[-4, -2, 4]} intensity={.7} color="#93c5fd" />
      <Float speed={1.4} rotationIntensity={.4} floatIntensity={1.1}>
        <DNA />
      </Float>
    </Canvas>
  )
}
