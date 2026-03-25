import { useRef } from 'react'
import { Group } from 'three'
import { Html } from '@react-three/drei'

export default function DNSNode({ position }: { position: [number, number, number] }) {
  const group = useRef<Group>(null)

  return (
    <group position={position} ref={group}>
      {/* Database Cylinders */}
      {[0, 0.6, 1.2].map((y, i) => (
        <mesh key={i} position={[0, y - 0.6, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.5, 32]} />
          <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.4} />
          {/* Glowing ring */}
          <mesh position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.55, 0.61, 32]} />
            <meshBasicMaterial color="#06b6d4" side={2} />
          </mesh>
        </mesh>
      ))}

      {/* Label */}
      <Html position={[0, 1.2, 0]} center zIndexRange={[100, 0]}>
        <div className="bg-cyan-950/80 backdrop-blur-sm border border-cyan-700/50 text-xs px-2 py-1 rounded-md text-cyan-100 pointer-events-none whitespace-nowrap shadow-[0_0_10px_rgba(6,182,212,0.5)]">
          <span className="font-bold">DNS Server</span> (MX Lookup)
        </div>
      </Html>
    </group>
  )
}
