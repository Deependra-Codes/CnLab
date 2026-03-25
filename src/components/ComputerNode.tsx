import { useRef } from 'react'
import { Group } from 'three'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export default function ComputerNode({ position, label, isSender }: { position: [number, number, number], label: string, isSender: boolean }) {
  const group = useRef<Group>(null)
  
  const screenColor = isSender ? '#3b82f6' : '#10b981' // Blue for Alice, Emerald for Bob
  const caseColor = '#1a1a24'

  return (
    <group position={position} ref={group}>
      {/* Monitor Base Stand */}
      <mesh position={[0, -0.6, -0.2]}>
        <cylinderGeometry args={[0.3, 0.4, 0.1, 16]} />
        <meshStandardMaterial color={caseColor} roughness={0.7} />
      </mesh>
      {/* Stand Neck */}
      <mesh position={[0, -0.3, -0.2]}>
        <boxGeometry args={[0.1, 0.6, 0.1]} />
        <meshStandardMaterial color={caseColor} roughness={0.7} />
      </mesh>

      {/* Monitor Screen Frame */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.4, 0.9, 0.1]} />
        <meshStandardMaterial color={caseColor} roughness={0.5} />
      </mesh>
      
      {/* Glowing Screen Area */}
      <mesh position={[0, 0.2, 0.06]}>
        <planeGeometry args={[1.3, 0.8]} />
        <meshBasicMaterial color={screenColor} toneMapped={false} />
      </mesh>
      {/* Screen "Code" lines placeholder */}
      {[-0.2, 0, 0.2].map((y, i) => (
        <mesh key={i} position={[-0.2, y + 0.2, 0.07]}>
          <planeGeometry args={[0.5, 0.05]} />
          <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
        </mesh>
      ))}

      {/* Keyboard Deck */}
      <mesh position={[0, -0.65, 0.4]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[1.2, 0.05, 0.5]} />
        <meshStandardMaterial color={caseColor} roughness={0.8} />
      </mesh>
      {/* Keyboard Keys glow */}
      <mesh position={[0, -0.62, 0.4]} rotation={[-0.1, 0, 0]}>
        <planeGeometry args={[1.0, 0.35]} />
        <meshBasicMaterial color={screenColor} opacity={0.3} transparent />
      </mesh>

      {/* Label */}
      <Html position={[0, 1.0, 0]} center zIndexRange={[100, 0]} wrapperClass="pointer-events-none">
        <div className="bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 text-xs px-2 py-1 rounded-md text-white pointer-events-none whitespace-nowrap shadow-lg">
          <span className="font-bold text-zinc-300">MUA</span>: {label}
        </div>
      </Html>
    </group>
  )
}
