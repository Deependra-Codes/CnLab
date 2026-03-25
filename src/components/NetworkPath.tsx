import { Line } from '@react-three/drei'
import * as THREE from 'three'

export default function NetworkPath({ start, end, color = "#4b5563", active = false, dashed = false }: { start: [number, number, number], end: [number, number, number], color?: string, active?: boolean, dashed?: boolean }) {
  
  // Calculate a slight bezier curve to make lines look more organic instead of straight lines
  const startVec = new THREE.Vector3(...start)
  const endVec = new THREE.Vector3(...end)
  
  const distance = startVec.distanceTo(endVec)
  
  // Midpoint elevated slightly
  const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)
  midPoint.y += distance * 0.2 // arch height based on distance

  const curve = new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec)
  const points = curve.getPoints(50)

  return (
    <group>
      <Line
        points={points}
        color={active ? '#ffffff' : color}
        lineWidth={active ? 3 : 1.5}
        dashed={dashed}
        dashSize={dashed ? 0.3 : undefined}
        dashScale={dashed ? 0.1 : undefined}
        gapSize={dashed ? 0.2 : undefined}
        transparent
        opacity={active ? 0.9 : 0.4}
      />
    </group>
  )
}
