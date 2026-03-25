import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Html } from '@react-three/drei'
import NetworkScene, { POSITIONS } from './components/NetworkScene'
import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

// Humanized educational conversations explaining the networking phases
const SIMULATION_STEPS = [
  { id: 0, name: "The Curious Student", logs: ["Chintu is typing late at night...", "He searches the internet...", "> Search: 'How does an e-mail system work?'"] },
  { id: 1, name: "A Magical Guide Appears", logs: ["< Hello Chintu! I am D, your network guide!", "< Ready to explore the complete email world together?", "< Let's walk through the internet!"] },
  { id: 2, name: "TCP 3-Way Handshake", logs: ["> Wow, we shrunk! Hi Sender MTA! I need to send an email to Bob.", "< Sure thing, Chintu! But first, let's open a reliable TCP connection.", "The Mail User Agent (MUA) and Mail Transfer Agent (MTA) perform a 3-way handshake."] },
  { id: 3, name: "STARTTLS Security", logs: ["> Wait, we shouldn't send my email in plain text! Do you support TLS encryption?", "< I do! Let me send you my cryptographic certificate.", "The connection secures itself. All further communication is now safely encrypted!"] },
  { id: 4, name: "SMTP Submission", logs: ["> Here are my login credentials. The email payload is attached.", "< Credentials accepted. I've placed the email into my outgoing delivery queue.", "The Sender MTA takes responsibility for delivering the email globally."] },
  { id: 5, name: "DNS Root Query", logs: ["> Hey Root DNS (.)! We need to deliver an email to 'other.com'. Do you know their IP address?", "< I don't route specific domains. But I manage Top Level Domains. Ask the '.com' TLD Server!"] },
  { id: 6, name: "DNS TLD Query", logs: ["> Hello '.com' TLD Server! Root sent us. Do you know where 'other.com' is?", "< I only track which provider registered the domain. Go ask their specific Authoritative Nameserver!"] },
  { id: 7, name: "DNS Authoritative Query", logs: ["> Hey Authoritative DNS! What is the Mail Exchange (MX) record for 'other.com'?", "< Found it! To deliver mail to 'other.com', connect to the IP address of 'mail.other.com'.", "We finally know exactly where Bob's email server lives!"] },
  { id: 8, name: "Routing: Hop 1", logs: ["> I'm packaging the email into IP data packets and firing them into the internet backbone!", "The packets enter the vast web of global Internet Exchange Providers (IXPs)."] },
  { id: 9, name: "Routing: Hop 2", logs: ["> Receiving packets from Router 1. Calculating the fastest BGP route across the ocean...", "< Route locked. Forwarding optical frames to the destination network's edge router!"] },
  { id: 10, name: "Routing: Hop 3", logs: ["> Packet arriving at the destination ISP gateway.", "The internet routing completes, and we arrive at Bob's destination network."] },
  { id: 11, name: "Receiver MTA Handshake", logs: ["> Hello Receiver MTA! We have an incoming email from Chintu's domain. Can we talk?", "< Greetings Sender MTA. Let's establish a secure Server-to-Server encrypted link first!"] },
  { id: 12, name: "Security Validation", logs: ["< Before I accept this, let me run background checks to ensure you aren't sending spam.", "< Checking Sender Policy Framework (SPF)... PASS! Chintu is an authorized sender.", "< Checking DKIM Digital Signature... PASS! The email wasn't tampered with.", "< Security checks cleared! I will accept Chintu's email."] },
  { id: 13, name: "MDA Spooling", logs: ["> Handing the email off to you, Mail Delivery Agent (MDA). Keep it safe!", "< Thanks MTA! I'm taking the network packet and saving it to Bob's local hard drive storage."] },
  { id: 14, name: "IMAP Fetch", logs: ["> Hey local storage! I'm Bob's MUA. Any new emails for me today?", "< Yes Bob! You have one unread email from Chintu. Here is the payload!", "The MUA uses IMAP to securely download the message. The journey is complete!"] },
]

const getActiveNodes = (step: number) => {
    switch (step) {
      case 0: return null
      case 1: return [
        [POSITIONS.SENDER_MUA[0], 0, POSITIONS.SENDER_MUA[2]], // Chintu POV Center
        [POSITIONS.SENDER_MUA[0] - 2, 0, POSITIONS.SENDER_MUA[2] + 2] // Guide "D" Position
      ]
      case 2: case 3: case 4: return [POSITIONS.SENDER_MUA, POSITIONS.SENDER_MTA]
      case 5: return [POSITIONS.SENDER_MTA, POSITIONS.DNS_ROOT]
      case 6: return [POSITIONS.SENDER_MTA, POSITIONS.DNS_TLD]
      case 7: return [POSITIONS.SENDER_MTA, POSITIONS.DNS_AUTH]
      case 8: return [POSITIONS.SENDER_MTA, POSITIONS.ROUTER_1]
      case 9: return [POSITIONS.ROUTER_1, POSITIONS.ROUTER_2]
      case 10: return [POSITIONS.ROUTER_2, POSITIONS.RECEIVER_MTA]
      case 11: case 12: return [POSITIONS.ROUTER_2, POSITIONS.RECEIVER_MTA]
      case 13: return [POSITIONS.RECEIVER_MTA, POSITIONS.RECEIVER_MDA]
      case 14: return [POSITIONS.RECEIVER_MDA, POSITIONS.RECEIVER_MUA]
      default: return null
    }
}

// Third-Person POV Camera Rig and Physical Player Models
function ThirdPersonCinematicRig({ step, controlsRef, currentLog }: { step: number, controlsRef: any, currentLog?: string }) {
  const { camera } = useThree()
  
  const isDSpeaking = currentLog?.startsWith('<')
  const isChintuSpeaking = currentLog?.startsWith('>')
  const dLog = isDSpeaking ? currentLog?.replace('< ', '') : ''
  const chintuLog = isChintuSpeaking ? currentLog?.replace('> ', '') : ''

  // Look Target (The active network path midpoint)
  const targetFocus = useRef(new THREE.Vector3(0, 0, 0))
  // Chintu's continuous physical position walking across the floor
  const targetHeroPos = useRef(new THREE.Vector3(0, 0, 0)) 
  const currentHeroPos = useRef(new THREE.Vector3(0, 0, 0))

  // The Magical Guide "D"
  const dRef = useRef<THREE.Group>(null)
  const chintuRef = useRef<THREE.Group>(null)
  
  // Visibility
  const [dVisible, setDVisible] = useState(false)
  const [chintuVisible, setChintuVisible] = useState(false)

  useEffect(() => {
    // Initial grounded start position
    const start = POSITIONS.SENDER_MUA
    currentHeroPos.current.set(start[0], 0, start[2] + 4)
  }, [])

  useEffect(() => {
    if (step >= 1) setDVisible(true)
    if (step >= 2) setChintuVisible(true) // Chintu shrinks and appears on the network floor in Step 2

    const nodes = getActiveNodes(step)
    if (step === 0) {
      // OVER-THE-SHOULDER: Looking at Chintu sitting at the desk. Hero pos is behind the chair.
      const start = POSITIONS.SENDER_MUA
      targetFocus.current.set(start[0], start[1] + 1.0, start[2] - 0.5)
      targetHeroPos.current.set(start[0], 0, start[2] + 6)
    } else if (step === 1) {
      // THE GUIDE APPEARS
      const start = POSITIONS.SENDER_MUA
      targetFocus.current.set(start[0] - 1, start[1] + 1.0, start[2] + 1) 
      targetHeroPos.current.set(start[0], 0, start[2] + 6) 
    } else if (nodes) {
      // THIRD PERSON INTERNET JOURNEY
      const [start, end] = nodes
      const midX = (start[0] + end[0]) / 2
      const midY = (start[1] + end[1]) / 2
      const midZ = (start[2] + end[2]) / 2
      
      const dx = start[0] - end[0]
      const dz = start[2] - end[2]
      const dist = Math.sqrt(dx*dx + dz*dz)
      
      targetFocus.current.set(midX, midY + 1.0, midZ) // Look at the connection midpoint
      
      // Hero (Chintu) stands slightly pulled back from the midpoint to view both nodes
      // Pushing slightly back on Z coordinates as the network nodes are arranged left-to-right
      const pushBack = Math.max(6, dist * 0.7)
      targetHeroPos.current.set(midX, midY, midZ + pushBack)
    }
  }, [step])

  useFrame((state) => {
    if (!controlsRef.current) return

    // Lerp Hero's physical ground position
    currentHeroPos.current.lerp(targetHeroPos.current, 0.05)
    
    // Calculate walking animation (simulate footsteps!)
    const distanceToTarget = currentHeroPos.current.distanceTo(targetHeroPos.current)
    const isWalking = distanceToTarget > 0.5 && step >= 2
    let jumpBob = 0
    if (isWalking) {
      jumpBob = Math.abs(Math.sin(state.clock.elapsedTime * 12)) * 0.4
    } else {
      jumpBob = Math.sin(state.clock.elapsedTime * 3) * 0.05 // Idle breathe
    }

    // 1. Compute Path Forward (Hero to Focus)
    const pathForward = new THREE.Vector3().subVectors(targetFocus.current, currentHeroPos.current)
    pathForward.y = 0
    if (pathForward.lengthSq() < 0.1) pathForward.set(0, 0, -1)
    pathForward.normalize()
    
    // Compute Path Right (perpendicular to forward)
    const pathRight = new THREE.Vector3().crossVectors(pathForward, new THREE.Vector3(0, 1, 0)).normalize()

    // 2. Chintu's model placement
    if (chintuVisible && chintuRef.current) {
       chintuRef.current.position.copy(currentHeroPos.current)
       chintuRef.current.position.y += jumpBob
       
       if (isDSpeaking && dRef.current) {
           chintuRef.current.lookAt(dRef.current.position) // Look at D when D is speaking
       } else {
           chintuRef.current.lookAt(targetFocus.current) // Look at the active nodes!
       }
    }

    // 3. Guide "D" physically walks beside Chintu!
    if (dVisible && dRef.current) {
      if (step === 1) {
        // D standing beside the physical desk
        dRef.current.position.lerp(new THREE.Vector3(POSITIONS.SENDER_MUA[0] - 2, 0, POSITIONS.SENDER_MUA[2] + 2), 0.1)
        dRef.current.lookAt(new THREE.Vector3(POSITIONS.SENDER_MUA[0], 1, POSITIONS.SENDER_MUA[2])) // Look at Chintu at desk
        dRef.current.position.y += Math.sin(state.clock.elapsedTime * 3) * 0.05
      } else {
        // D stands slightly to the right of Chintu
        const dTargetX = currentHeroPos.current.x + (pathRight.x * 2.5)
        const dTargetZ = currentHeroPos.current.z + (pathRight.z * 2.5)
        
        let dBob = 0
        if (isWalking) {
           dBob = Math.abs(Math.sin(state.clock.elapsedTime * 13)) * 0.4
        } else {
           dBob = Math.sin(state.clock.elapsedTime * 3) * 0.05
        }
        
        dRef.current.position.lerp(new THREE.Vector3(dTargetX, dBob, dTargetZ), 0.08)
        
        // Interactive Head Turning Logic for D
        if (isChintuSpeaking && chintuRef.current) {
           dRef.current.lookAt(chintuRef.current.position) // Turn head to Chintu
        } else {
           const nodeLevelFocus = new THREE.Vector3().copy(targetFocus.current)
           nodeLevelFocus.y = 1.0
           dRef.current.lookAt(nodeLevelFocus) // Watch the network
        }
      }
    }

    // 4. Perfectly Stabilized Third-Person Camera Tracking
    // Camera stays behind Chintu (Hero)
    const camOffset = new THREE.Vector3(
      currentHeroPos.current.x - (pathForward.x * 12), // 12 units behind
      currentHeroPos.current.y + 7,                    // 7 units high
      currentHeroPos.current.z - (pathForward.z * 12)
    )
    
    // Very smoothly drag the camera to the offset
    camera.position.lerp(camOffset, 0.05)

    // Smoothly drag OrbitControls target to see BOTH the characters in the foreground, and the network nodes in the background!
    const cameraLookTarget = new THREE.Vector3().lerpVectors(currentHeroPos.current, targetFocus.current, 0.6)
    cameraLookTarget.y += 1.0
    
    controlsRef.current.target.lerp(cameraLookTarget, 0.06)
    controlsRef.current.update()
  })

  // The Completely Custom Roblox-Style Companion Models
  return (
    <>
      {/* GUIDE D */}
      {dVisible && (
        <group ref={dRef} position={[POSITIONS.SENDER_MUA[0], -5, POSITIONS.SENDER_MUA[2]]} scale={0.65}>
          <pointLight color="#3b82f6" intensity={1.5} distance={6} position={[0, 1, 0]} />
          {/* Head */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#fcd34d" roughness={0.5} />
            {/* Sunglasses Cool Visor */}
            <mesh position={[0, 0.02, 0.16]}>
              <boxGeometry args={[0.22, 0.08, 0.04]} />
              <meshStandardMaterial color="#020617" emissive="#0ea5e9" emissiveIntensity={1.5} />
            </mesh>
          </mesh>
          {/* Torso */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.2]} />
            <meshStandardMaterial color="#3b82f6" roughness={0.4} emissive="#1d4ed8" emissiveIntensity={0.3} />
          </mesh>
          {/* Legs */}
          <mesh position={[-0.1, -0.2, 0]}>
            <boxGeometry args={[0.15, 0.3, 0.15]} />
            <meshStandardMaterial color="#1e3a8a" />
          </mesh>
          <mesh position={[0.1, -0.2, 0]}>
            <boxGeometry args={[0.15, 0.3, 0.15]} />
            <meshStandardMaterial color="#1e3a8a" />
          </mesh>
          {/* Arms */}
          <mesh position={[-0.25, 0.15, 0]}>
            <boxGeometry args={[0.1, 0.4, 0.1]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
          <mesh position={[0.25, 0.15, 0]}>
            <boxGeometry args={[0.1, 0.4, 0.1]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
          {/* Name Tag Hologram */}
          <Html position={[0, 0.8, 0]} center zIndexRange={[100, 0]} wrapperClass="pointer-events-none">
            <div className="bg-blue-900/80 backdrop-blur border border-blue-400 px-1.5 py-0.5 rounded shadow text-[10px] font-black text-white tracking-widest pointer-events-none drop-shadow-md">
              Guide [D]
            </div>
          </Html>
          
          {/* D's Speech Bubble! */}
          {isDSpeaking && (
            <Html position={[0, 2.5, 0]} center zIndexRange={[100, 0]} wrapperClass="pointer-events-none">
              <div className="animate-in fade-in zoom-in duration-300 slide-in-from-bottom-2 -mt-10">
                <div className="px-4 py-3 rounded-xl backdrop-blur-xl border border-blue-500/50 bg-blue-950/90 text-blue-200 text-sm font-bold shadow-[0_10px_30px_rgba(59,130,246,0.5)] w-max max-w-[18rem] text-center whitespace-normal leading-relaxed">
                  <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] animate-pulse mx-auto mb-1.5" />
                  {dLog}
                </div>
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-blue-900/90 mx-auto"></div>
              </div>
            </Html>
          )}
        </group>
      )}

      {/* CHINTU (Avatar Form) */}
      {chintuVisible && (
        <group ref={chintuRef} position={[POSITIONS.SENDER_MUA[0], -5, POSITIONS.SENDER_MUA[2]]} scale={0.65}>
          <pointLight color="#22c55e" intensity={1.0} distance={5} position={[0, 1, 0]} />
          {/* Head */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.25, 0.25, 0.25]} />
            <meshStandardMaterial color="#fcd34d" roughness={0.5} />
            {/* Eyes */}
            <mesh position={[-0.05, 0.06, 0.13]}>
              <boxGeometry args={[0.04, 0.04, 0.02]} />
              <meshBasicMaterial color="#000" />
            </mesh>
            <mesh position={[0.05, 0.06, 0.13]}>
              <boxGeometry args={[0.04, 0.04, 0.02]} />
              <meshBasicMaterial color="#000" />
            </mesh>
          </mesh>
          {/* Torso */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[0.35, 0.4, 0.2]} />
            <meshStandardMaterial color="#ef4444" roughness={0.6} emissive="#ef4444" emissiveIntensity={0.1} />
          </mesh>
          {/* Legs */}
          <mesh position={[-0.1, -0.2, 0]}>
            <boxGeometry args={[0.12, 0.3, 0.12]} />
            <meshStandardMaterial color="#1e3a8a" />
          </mesh>
          <mesh position={[0.1, -0.2, 0]}>
            <boxGeometry args={[0.12, 0.3, 0.12]} />
            <meshStandardMaterial color="#1e3a8a" />
          </mesh>
          {/* Arms */}
          <mesh position={[-0.25, 0.15, 0]}>
            <boxGeometry args={[0.1, 0.35, 0.1]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0.25, 0.15, 0]}>
            <boxGeometry args={[0.1, 0.35, 0.1]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          {/* Name Tag Hologram */}
          <Html position={[0, 0.8, 0]} center zIndexRange={[100, 0]} wrapperClass="pointer-events-none">
            <div className="bg-green-900/80 backdrop-blur border border-green-400 px-1.5 py-0.5 rounded shadow text-[10px] font-black text-white tracking-widest pointer-events-none drop-shadow-md">
              Chintu
            </div>
          </Html>
          
          {/* Chintu's 3D Speech Bubble! */}
          {isChintuSpeaking && (
            <Html position={[0, 2.5, 0]} center zIndexRange={[100, 0]} wrapperClass="pointer-events-none">
              <div className="animate-in fade-in zoom-in duration-300 slide-in-from-bottom-2 -mt-10">
                <div className="px-4 py-3 rounded-xl backdrop-blur-xl border border-green-500/50 bg-green-950/90 text-green-200 text-sm font-bold shadow-[0_10px_30px_rgba(34,197,94,0.5)] w-max max-w-[18rem] text-center whitespace-normal leading-relaxed">
                  <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse mx-auto mb-1.5" />
                  {chintuLog}
                </div>
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-green-900/90 mx-auto"></div>
              </div>
            </Html>
          )}
        </group>
      )}
    </>
  )
}

function App() {
  const [step, setStep] = useState(0)
  const [currentLogIndex, setCurrentLogIndex] = useState(0)
  const controlsRef = useRef<any>(null)

  const currentStepData = SIMULATION_STEPS[step]
  const currentLog = currentStepData?.logs[currentLogIndex]

  useEffect(() => {
    if (!currentStepData) return
    setCurrentLogIndex(0) // Reset dialog index when step changes
    
    // Increased interval slightly so users have time to read the dynamic dialogue
    const interval = setInterval(() => {
      setCurrentLogIndex(prev => {
        if (prev < currentStepData.logs.length - 1) {
          return prev + 1
        }
        clearInterval(interval)
        return prev
      })
    }, 4500) 
    
    return () => clearInterval(interval)
  }, [step])

  // Dialog bubble logic extracted for HUD
  const isSenderSpeaking = currentLog?.startsWith('>') // Chintu is speaking
  const isReceiverSpeaking = currentLog?.startsWith('<') // Guide D is speaking
  const isSystemMsg = currentLog && !isSenderSpeaking && !isReceiverSpeaking // Narrator

  const displayLog = currentLog?.replace(/^[><]\s*/, '')

  return (
    <div className="w-screen h-screen relative bg-[#09090b] text-zinc-100 overflow-hidden font-sans selection:bg-purple-900">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 30, 60], fov: 50 }}>
          <fog attach="fog" args={['#09090b', 5, 80]} />
          <color attach="background" args={['#09090b']} />
          <ambientLight intensity={1.2} />
          <directionalLight position={[10, 30, 20]} intensity={2.0} />
          <pointLight position={[-30, 20, -30]} intensity={2.0} color="#aa3bff" distance={200} decay={1} />
          <pointLight position={[30, 20, 30]} intensity={2.0} color="#06b6d4" distance={200} decay={1} />
          <Stars radius={150} depth={50} count={5000} factor={4} saturation={0} fade speed={1.5} />
          
          <NetworkScene step={step} />
          
          <OrbitControls 
            ref={controlsRef}
            makeDefault 
            enableDamping 
            dampingFactor={0.05} 
            maxPolarAngle={Math.PI / 2 - 0.05} 
            minDistance={0.5}
            maxDistance={120} 
          />
          {/* Perfectly Stabilized Third-Person Simulator Camera Rig */}
          <ThirdPersonCinematicRig step={step} controlsRef={controlsRef} currentLog={currentLog} />

        </Canvas>
      </div>

      {/* 2D HUD OVERLAYS for Chintu & System */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end items-center pb-24">
        
        {/* Chintu's Spoken Monologue (Only in Step 0 and 1, afterwards his speech is a 3D bubble attached to his avatar) */}
        {isSenderSpeaking && step < 2 && (
          <div key={`chintu-${currentLog}`} className="animate-in fade-in slide-in-from-bottom-8 duration-300 mb-8 w-full max-w-2xl px-4">
            <div className="px-8 py-5 mx-auto rounded-3xl backdrop-blur-xl border-2 border-green-500/30 bg-green-950/90 text-green-100 text-[16px] font-bold shadow-[0_0_50px_rgba(34,197,94,0.15)] text-center leading-relaxed">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse" />
                <span className="text-green-400 font-black tracking-widest text-[10px] uppercase">Chintu</span>
              </div>
              {displayLog}
            </div>
          </div>
        )}

        {/* System / Narrator Action Text */}
        {isSystemMsg && (
          <div key={`sys-${currentLog}`} className="animate-in fade-in zoom-in duration-500 mb-12">
            <div className="px-8 py-3 rounded-full backdrop-blur-md border border-zinc-700/50 bg-zinc-900/90 text-zinc-300 text-[11px] font-mono tracking-widest uppercase shadow-2xl flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse" />
               {displayLog}
            </div>
          </div>
        )}

      </div>

      <header className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center pointer-events-none">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 drop-shadow-md">E-Mail System Simulator</h1>
          <p className="text-zinc-300 text-sm font-medium drop-shadow-md">First-Person Protocol Visualization: DNS, Routing, SPF/DKIM, and IMAP</p>
        </div>
        <div className="flex gap-4 pointer-events-auto items-center">
          <span className="text-xs font-mono text-zinc-400 bg-zinc-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800 shadow-md">
            Phase {step} / {SIMULATION_STEPS.length - 1}
          </span>
          <button 
            disabled={step === 0}
            onClick={() => setStep(s => Math.max(0, s - 1))}
            className="backdrop-blur-md bg-zinc-900/80 px-4 py-2 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm transition-colors border border-zinc-700 cursor-pointer text-zinc-300 font-medium shadow-md">
            Previous
          </button>
          <button 
            disabled={step === SIMULATION_STEPS.length - 1}
            onClick={() => setStep(s => Math.min(SIMULATION_STEPS.length - 1, s + 1))}
            className="px-6 py-2 bg-purple-600/90 backdrop-blur-md hover:bg-purple-500/90 border border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-white text-sm transition-all shadow-[0_0_15px_rgba(147,51,234,0.4)] cursor-pointer font-bold tracking-wide">
            {step === SIMULATION_STEPS.length - 1 ? 'End' : 'Advance Timeline'}
          </button>
        </div>
      </header>
    </div>
  )
}

export default App
