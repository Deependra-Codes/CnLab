import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function NetworkPacket({ start, end, active, color = "#ffffff", speed = 0.8 }: { start: [number, number, number], end: [number, number, number], active: boolean, color?: string, speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  
  // Curve calculation identical to NetworkPath
  const startVec = new THREE.Vector3(...start)
  const endVec = new THREE.Vector3(...end)
  const distance = startVec.distanceTo(endVec)
  const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)
  midPoint.y += distance * 0.2
  
  const curve = new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec)

  useEffect(() => {
    if (active) {
      setProgress(0)
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [active])

  useFrame((state, delta) => {
    if (visible && meshRef.current) {
      if (progress < 1) {
        // Animate progress
        const newProgress = Math.min(1, progress + delta * speed)
        setProgress(newProgress)
        // Update position along curve
        const point = curve.getPoint(newProgress)
        meshRef.current.position.copy(point)
      } else if (!active) {
          setVisible(false)
      }
      
      // Pulse effect
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 15) * 0.2)
    }
  })

  if (!visible) return null

  return (
    <mesh ref={meshRef} position={start}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
      {/* Light emission from packet */}
      <pointLight color={color} intensity={10} distance={3} decay={2} />
    </mesh>
  )
}
