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
        const tangent = curve.getTangent(newProgress)
        
        meshRef.current.position.copy(point)
        // Orient the envelope to face the direction of flight
        meshRef.current.lookAt(point.clone().add(tangent))
      } else if (!active) {
          setVisible(false)
      }
    }
  })

  if (!visible) return null

  return (
    <group ref={meshRef} position={start}>
      {/* Envelope Body */}
      <mesh>
        <boxGeometry args={[0.8, 0.5, 0.05]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      {/* Envelope Flap */}
      <mesh position={[0, 0.25, 0.03]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.55, 0.55, 0.02]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      {/* Light emission from packet */}
      <pointLight color={color} intensity={8} distance={5} decay={2} />
    </group>
  )
}
