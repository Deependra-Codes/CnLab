import { useRef } from 'react'
import { Group } from 'three'
import { Html } from '@react-three/drei'

export default function ServerNode({ position, label, type }: { position: [number, number, number], label: string, type: 'MTA' | 'MDA' }) {
  const group = useRef<Group>(null)
  
  const accentColor = type === 'MTA' ? '#a855f7' : '#f59e0b' // Purple MTA, amber MDA

  return (
    <group position={position} ref={group}>
      {/* Server Rack Box */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 2, 1.2]} />
        <meshStandardMaterial color="#1a1a24" metalness={0.9} roughness={0.3} />
      </mesh>
      
      {/* Server Slots/Lights */}
      {[-0.6, -0.2, 0.2, 0.6].map((y, i) => (
        <mesh key={i} position={[0.41, y, 0]}>
          <planeGeometry args={[0.05, 0.8]} />
          <meshBasicMaterial color={Math.random() > 0.3 ? accentColor : '#333'} />
        </mesh>
      ))}

      {/* Label */}
      <Html position={[0, 1.3, 0]} center zIndexRange={[100, 0]}>
        <div className="bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 text-xs px-2 py-1 rounded-md text-white pointer-events-none whitespace-nowrap shadow-lg">
          <span className="font-bold text-zinc-300">{type}</span>: {label}
        </div>
      </Html>
    </group>
  )
}
