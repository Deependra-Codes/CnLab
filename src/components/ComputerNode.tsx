import { useRef, useState } from 'react'
import { Group } from 'three'
import { Html } from '@react-three/drei'

export default function ComputerNode({ position, label, isSender }: { position: [number, number, number], label: string, isSender: boolean }) {
  const group = useRef<Group>(null)
  const [hovered, setHover] = useState(false)
  const color = isSender ? '#3b82f6' : '#10b981' // Blue for sender, Green for receiver

  return (
    <group position={position} ref={group}>
      {/* Base */}
      <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.1, 1]} />
        <meshStandardMaterial color="#1f1f2e" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Monitor Screen */}
      <mesh position={[0, 0.1, -0.4]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[1.4, 0.9, 0.05]} />
        <meshStandardMaterial color="#2d2d3f" />
      </mesh>
      
      {/* Screen Glow */}
      <mesh position={[0, 0.1, -0.37]} rotation={[0.1, 0, 0]} 
        onPointerOver={() => setHover(true)} 
        onPointerOut={() => setHover(false)}>
        <planeGeometry args={[1.3, 0.8]} />
        <meshBasicMaterial color={hovered ? '#ffffff' : color} transparent opacity={0.6} />
      </mesh>

      {/* Label */}
      <Html position={[0, 0.8, 0]} center zIndexRange={[100, 0]}>
        <div className="bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 text-xs px-2 py-1 rounded-md text-white pointer-events-none whitespace-nowrap shadow-lg">
          <span className="font-bold text-zinc-300">MUA</span>: {label}
        </div>
      </Html>
    </group>
  )
}
