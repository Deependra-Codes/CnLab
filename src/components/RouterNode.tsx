import { useRef } from 'react'
import { Group, Mesh } from 'three'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export default function RouterNode({ position, label }: { position: [number, number, number], label: string }) {
  const group = useRef<Group>(null)
  const coreRef = useRef<Mesh>(null)

  const routerColor = '#ec4899' // Pink/Rose for Internet Backbone Routers

  // Pulsing Hexagon core
  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y = state.clock.elapsedTime * 0.2
      coreRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1
    }
  })

  return (
    <group position={position} ref={group}>
      {/* Outer Shell (Hexagonal or Octagonal) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.8, 8]} />
        <meshStandardMaterial color="#1f1f2e" metalness={0.6} roughness={0.3} wireframe={false} />
      </mesh>

      {/* Outer Wireframe Cage */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 0.85, 8]} />
        <meshBasicMaterial color={routerColor} wireframe={true} transparent opacity={0.2} />
      </mesh>

      {/* Inner Glowing Core Component */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <octahedronGeometry args={[0.5]} />
        <meshBasicMaterial color={routerColor} wireframe={true} transparent opacity={0.6} />
      </mesh>

      {/* Router Antennas / Uplinks */}
      {[-0.6, 0.6].map((x, i) => (
        <group key={i} position={[x, 0.4, 0]}>
          <mesh position={[0, 0.3, 0]}>
             <cylinderGeometry args={[0.02, 0.04, 0.6, 8]} />
             <meshStandardMaterial color="#444" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
             <sphereGeometry args={[0.08, 8, 8]} />
             <meshBasicMaterial color={routerColor} />
          </mesh>
        </group>
      ))}

      {/* Glowing Base Platform */}
      <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.2, 32]} />
        <meshBasicMaterial color={routerColor} transparent opacity={0.2} side={2} />
      </mesh>

      {/* Label */}
      <Html position={[0, 1.3, 0]} center zIndexRange={[100, 0]} wrapperClass="pointer-events-none">
        <div className="bg-pink-950/80 backdrop-blur-sm border border-pink-700/50 text-[10px] px-2 py-1 rounded-md text-pink-100 pointer-events-none whitespace-nowrap shadow-[0_0_15px_rgba(236,72,153,0.4)]">
          <span className="font-bold">ROUTER</span>: {label}
        </div>
      </Html>
    </group>
  )
}
