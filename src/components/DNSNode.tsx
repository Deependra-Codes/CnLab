import { useRef } from 'react'
import { Group, Mesh } from 'three'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export default function DNSNode({ position, label }: { position: [number, number, number], label: string }) {
  const group = useRef<Group>(null)
  const ringRef = useRef<Mesh>(null)

  // Rotate rings slowly
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  // Cyan theme for DNS
  const themeColor = '#06b6d4'

  return (
    <group position={position} ref={group}>
      {/* DNS Discs (Database Icon representation) */}
      {[-0.6, 0, 0.6].map((y, i) => (
        <group key={i} position={[0, y, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.7, 0.7, 0.4, 32]} />
            <meshStandardMaterial color="#111827" metalness={0.7} roughness={0.2} />
          </mesh>
          {/* Glowing rim */}
          <mesh position={[0, 0.21, 0]}>
            <ringGeometry args={[0.6, 0.7, 32]} />
            <meshBasicMaterial color={themeColor} rotation={[-Math.PI / 2, 0, 0]} />
          </mesh>
          {/* Status Lights on cylinder sides */}
          {Array.from({ length: 4 }).map((_, j) => (
            <mesh key={j} position={[Math.cos((j * Math.PI) / 2) * 0.71, 0, Math.sin((j * Math.PI) / 2) * 0.71]} rotation={[0, (-j * Math.PI) / 2, 0]}>
              <planeGeometry args={[0.1, 0.1]} />
              <meshBasicMaterial color={themeColor} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Floating Holographic Ring */}
      <mesh ref={ringRef} position={[0, 0, 0]} rotation={[0.4, 0, 0.2]}>
        <torusGeometry args={[1.2, 0.02, 16, 64]} />
        <meshBasicMaterial color={themeColor} transparent opacity={0.6} />
      </mesh>

      {/* Central Axis Pillar */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 2.0, 16]} />
        <meshStandardMaterial color="#222" metalness={0.9} />
      </mesh>

      {/* Label */}
      <Html position={[0, 1.4, 0]} center zIndexRange={[100, 0]} wrapperClass="pointer-events-none">
        <div className="bg-cyan-950/80 backdrop-blur-sm border border-cyan-700/50 text-xs px-2 py-1 rounded-md text-cyan-100 pointer-events-none whitespace-nowrap shadow-[0_0_10px_rgba(6,182,212,0.5)]">
          <span className="font-bold">DNS</span>: {label}
        </div>
      </Html>
    </group>
  )
}
