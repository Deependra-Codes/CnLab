import { useRef } from 'react'
import { Group } from 'three'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export default function ServerNode({ position, label, type }: { position: [number, number, number], label: string, type: 'MTA' | 'MDA' }) {
  const group = useRef<Group>(null)
  
  // Purple for MTA, Amber for MDA
  const accentColor = type === 'MTA' ? '#a855f7' : '#f59e0b' 

  // Create subtle bobbing or blinking lights via useFrame
  useFrame(({ clock }) => {
    if (group.current) {
        // We can access individual meshes if we ref them to blink, but we'll use math in material or rely on NetworkPacket for dynamic traffic
    }
  })

  return (
    <group position={position} ref={group}>
      {/* Main Tall Server Rack Base */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.0, 3.0, 1.2]} />
        <meshStandardMaterial color="#0c0c10" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Rack Inner Frame details */}
      <mesh position={[0, 0, 0.61]}>
        <planeGeometry args={[0.9, 2.9]} />
        <meshBasicMaterial color="#050508" />
      </mesh>
      
      {/* 8 Server Blade Slots inside the rack */}
      {[-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2].map((y, i) => (
        <group key={i} position={[0, y, 0.62]}>
          {/* Blade Body */}
          <mesh>
            <boxGeometry args={[0.85, 0.3, 0.05]} />
            <meshStandardMaterial color="#1a1a24" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Status Lights Row A */}
          <mesh position={[-0.3, 0, 0.03]}>
            <planeGeometry args={[0.08, 0.08]} />
            <meshBasicMaterial color={i % 2 === 0 ? accentColor : '#333'} />
          </mesh>
          {/* Status Lights Row B */}
          <mesh position={[-0.15, 0, 0.03]}>
            <planeGeometry args={[0.08, 0.08]} />
            <meshBasicMaterial color={i % 3 === 0 ? '#10b981' : '#333'} />
          </mesh>
          {/* Air Vent Grilles */}
          <mesh position={[0.2, 0, 0.03]}>
            <planeGeometry args={[0.3, 0.15]} />
            <meshBasicMaterial color="#000" />
          </mesh>
        </group>
      ))}

      {/* Ground Shadow Plate */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 1.7]} />
        <meshBasicMaterial color="#000000" opacity={0.4} transparent />
      </mesh>

      {/* Networking Cable Bundle (Decorative back) */}
      <mesh position={[0, 0, -0.65]}>
        <cylinderGeometry args={[0.1, 0.1, 2.8, 8]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>

      {/* Label */}
      <Html position={[0, 1.8, 0]} center zIndexRange={[100, 0]} wrapperClass="pointer-events-none">
        <div className="bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 text-xs px-2 py-1 rounded-md text-white pointer-events-none whitespace-nowrap shadow-lg">
          <span className="font-bold" style={{ color: accentColor }}>{type}</span>: {label}
        </div>
      </Html>
    </group>
  )
}
