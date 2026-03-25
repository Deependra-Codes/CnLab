import { useRef, useState, useEffect } from 'react'
import { Group } from 'three'
import { Html } from '@react-three/drei'
export default function ComputerNode({ position, label, isSender, step = 0 }: { position: [number, number, number], label: string, isSender: boolean, step?: number }) {
  const group = useRef<Group>(null)
  
  const screenColor = isSender ? '#ffffff' : '#10b981' // Green for receiver
  const caseColor = '#1a1a24'
  
  // Real typing animation state!
  const [typedText, setTypedText] = useState('')
  const fullText = "How does an e-mail system work?"
  
  useEffect(() => {
    if (!isSender) return
    let i = 0
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i))
      i++
      if (i > fullText.length) clearInterval(interval)
    }, 150)
    return () => clearInterval(interval)
  }, [isSender])

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
        <meshBasicMaterial color={isSender ? "#ffffff" : screenColor} toneMapped={false} />
        {isSender && (
          <Html transform position={[0, 0, 0.01]} scale={0.08} center distanceFactor={1.2}>
            <div className="w-[180px] h-[110px] bg-white rounded flex flex-col p-2 border shadow-inner select-none pointer-events-none">
               <div className="text-center font-bold text-blue-600 text-[14px] mt-1 mb-2">SearchEngine</div>
               <div className="border border-zinc-300 rounded-full px-2 py-1 flex items-center shadow-sm">
                 <div className="w-2 h-2 rounded-full border border-zinc-400 mr-1 opacity-50"></div>
                 <div className="text-[7.5px] text-zinc-800 font-bold tracking-tighter" style={{ minWidth: '10px' }}>{typedText}</div>
                 <div className="ml-0.5 w-1 h-3 bg-blue-500 animate-pulse"></div>
               </div>
               <div className="mt-4 flex justify-center gap-2">
                 <div className="bg-zinc-100 px-2 py-0.5 rounded text-[6px] text-zinc-600 font-bold border">Search</div>
                 <div className="bg-zinc-100 px-2 py-0.5 rounded text-[6px] text-zinc-600 font-bold border">Feeling Lucky</div>
               </div>
            </div>
          </Html>
        )}
        {!isSender && [-0.2, 0, 0.2].map((y, i) => (
          <mesh key={i} position={[-0.2, y, 0.01]}>
            <planeGeometry args={[0.5, 0.05]} />
            <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
          </mesh>
        ))}
      </mesh>
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

      {/* Chintu & AI Guide Character Models (Only on Sender) */}
      {isSender && step < 2 && (
        <group position={[0, -0.65, 0.8]}>
          {/* Chair */}
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[0.5, 0.4, 0.5]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, 0.2, 0.2]}>
            <boxGeometry args={[0.5, 0.6, 0.1]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          
          {/* Physical Chintu Character Model */}
          <group position={[0, 0.1, 0]}>
            {/* Torso */}
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.35, 0.4, 0.2]} />
              <meshStandardMaterial color="#ef4444" /> {/* Red shirt */}
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[0.25, 0.25, 0.25]} />
              <meshStandardMaterial color="#fcd34d" /> {/* Skin tone */}
            </mesh>
            {/* Arms - Interacting with the PC */}
            <mesh position={[-0.25, 0.15, 0.15]} rotation={[-0.5, 0, 0]}>
              <boxGeometry args={[0.1, 0.35, 0.1]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0.25, 0.15, 0.15]} rotation={[-0.5, 0, 0]}>
              <boxGeometry args={[0.1, 0.35, 0.1]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
          </group>
        </group>
      )}
    </group>
  )
}
