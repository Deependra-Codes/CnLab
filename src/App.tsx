import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Html } from '@react-three/drei'
import NetworkScene, { POSITIONS } from './components/NetworkScene'
import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

// Humanized educational conversations explaining the networking phases
const SIMULATION_STEPS = [
  { id: 0, name: "System Idle", logs: ["Welcome to the Interactive E-Mail Simulator!", "This 3D project visualizes exactly how an email travels across the internet.", "Waiting for Alice to click 'Send' on her email to Bob..."] },
  { id: 1, name: "TCP 3-Way Handshake", logs: ["> Hi Sender MTA! Alice wrote an email to Bob. Can I send it to you?", "< Sure thing, Alice's MUA! But first, let's open a reliable TCP connection.", "The Mail User Agent (MUA) and Mail Transfer Agent (MTA) perform a 3-way handshake."] },
  { id: 2, name: "STARTTLS Security", logs: ["> Wait, we shouldn't send passwords in plain text! Do you support TLS encryption?", "< I do! Let me send you my cryptographic certificate.", "The connection secures itself. All further communication is now safely encrypted!"] },
  { id: 3, name: "SMTP Submission", logs: ["> Here are my login credentials. The email is from Alice, going to Bob.", "< Credentials accepted. I've placed the email into my outgoing delivery queue.", "The Sender MTA takes responsibility for delivering the email across the internet."] },
  { id: 4, name: "DNS Root Query", logs: ["> Hey Root DNS (.)! I need to deliver an email to 'other.com'. Do you know their IP address?", "< I don't route specific domains. But I manage Top Level Domains. Ask the '.com' TLD Server!"] },
  { id: 5, name: "DNS TLD Query", logs: ["> Hello '.com' TLD Server! Root sent me. Do you know where 'other.com' is?", "< I only track which provider registered the domain. Go ask their specific Authoritative Nameserver!"] },
  { id: 6, name: "DNS Authoritative Query", logs: ["> Hey Authoritative DNS! What is the Mail Exchange (MX) record for 'other.com'?", "< Found it! To deliver mail to 'other.com', you must connect to the IP address of 'mail.other.com'.", "The Sender MTA finally knows exactly where on the internet Bob's email server lives!"] },
  { id: 7, name: "Routing: Hop 1", logs: ["> I'm packaging the email into IP data packets and firing them into the internet backbone!", "The packets enter the vast web of global Internet Exchange Providers (IXPs)."] },
  { id: 8, name: "Routing: Hop 2", logs: ["> Receiving packets from Router 1. Calculating the fastest BGP route across the ocean...", "< Route locked. Forwarding optical frames to the destination network's edge router!"] },
  { id: 9, name: "Routing: Hop 3", logs: ["> Packet arriving at the destination ISP gateway.", "The internet routing completes, and the packets finally arrive at Bob's destination mail server."] },
  { id: 10, name: "Receiver MTA Handshake", logs: ["> Hello Receiver MTA! I have an incoming email from Alice's domain. Can we talk?", "< Greetings Sender MTA. Let's establish a secure Server-to-Server encrypted link first!"] },
  { id: 11, name: "Security Validation", logs: ["< Before I accept this, let me run background checks to ensure you aren't sending spam.", "< Checking Sender Policy Framework (SPF)... PASS! You are an authorized sender.", "< Checking DKIM Digital Signature... PASS! The email wasn't tampered with.", "< Security checks cleared! I will accept Alice's email."] },
  { id: 12, name: "MDA Spooling", logs: ["> Handing the email off to you, Mail Delivery Agent (MDA). Keep it safe!", "< Thanks MTA! I'm taking the network packet and saving it to Bob's local hard drive storage."] },
  { id: 13, name: "IMAP Fetch", logs: ["> Hey local storage! I'm Bob's phone app. Any new emails for me today?", "< Yes Bob! You have one unread email from Alice. Here is the payload!", "The MUA uses IMAP to securely download the message. The journey is complete!"] },
]

const getActiveNodes = (step: number) => {
    switch (step) {
      case 1: case 2: case 3: return [POSITIONS.SENDER_MUA, POSITIONS.SENDER_MTA]
      case 4: return [POSITIONS.SENDER_MTA, POSITIONS.DNS_ROOT]
      case 5: return [POSITIONS.SENDER_MTA, POSITIONS.DNS_TLD]
      case 6: return [POSITIONS.SENDER_MTA, POSITIONS.DNS_AUTH]
      case 7: return [POSITIONS.SENDER_MTA, POSITIONS.ROUTER_1]
      case 8: return [POSITIONS.ROUTER_1, POSITIONS.ROUTER_2]
      case 9: return [POSITIONS.ROUTER_2, POSITIONS.RECEIVER_MTA]
      case 10: case 11: return [POSITIONS.ROUTER_2, POSITIONS.RECEIVER_MTA]
      case 12: return [POSITIONS.RECEIVER_MTA, POSITIONS.RECEIVER_MDA]
      case 13: return [POSITIONS.RECEIVER_MDA, POSITIONS.RECEIVER_MUA]
      default: return null
    }
}

// Rig to smoothly move the camera position and Target to perfectly frame the two communicating nodes
function CameraRig({ step, controlsRef }: { step: number, controlsRef: any }) {
  const { camera } = useThree()
  const targetFocus = useRef(new THREE.Vector3(0, 0, 0))
  const targetCamPos = useRef(new THREE.Vector3(0, 25, 45))

  useEffect(() => {
    const nodes = getActiveNodes(step)
    if (nodes) {
      const [start, end] = nodes
      
      // Calculate Midpoint to center the orbital controls target
      const midX = (start[0] + end[0]) / 2
      const midY = (start[1] + end[1]) / 2
      const midZ = (start[2] + end[2]) / 2
      targetFocus.current.set(midX, midY, midZ)
      
      // Calculate distance between nodes to determine how far the camera must pull back to fit both
      const dx = start[0] - end[0]
      const dz = start[2] - end[2]
      const dist = Math.sqrt(dx*dx + dz*dz)
      
      if (step <= 3) {
        // Intimate, low-angle tactical view for the local network (Sender Handshake)
        targetCamPos.current.set(midX, midY + 16, midZ + Math.max(25, dist * 1.4))
      } else if (step >= 12) {
        // Return to intimate tactical view for the final delivery (Receiver Network)
        targetCamPos.current.set(midX, midY + 16, midZ + Math.max(25, dist * 1.4))
      } else {
        // For DNS and Backbone Routing (Steps 4-11), swoop the camera high up to the TOP 
        // to provide a macro-level satellite map view of the massive internet distances!
        targetCamPos.current.set(midX, midY + Math.max(45, dist * 1.2), midZ + 15)
      }
    } else {
      // Idle / Overview shot
      targetFocus.current.set(-5, 0, 0)
      targetCamPos.current.set(-5, 30, 60)
    }
  }, [step])

  useFrame(() => {
    if (controlsRef.current) {
      // Smoothly lerp BOTH the lookat target and the physical camera body into position
      controlsRef.current.target.lerp(targetFocus.current, 0.04)
      camera.position.lerp(targetCamPos.current, 0.04)
      controlsRef.current.update()
    }
  })
  return null
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
    
    const interval = setInterval(() => {
      setCurrentLogIndex(prev => {
        if (prev < currentStepData.logs.length - 1) {
          return prev + 1
        }
        clearInterval(interval)
        return prev
      })
    }, 4500) // Much slower 4.5s interval to let users easily read the humanized story conversations
    
    return () => clearInterval(interval)
  }, [step])

  // Determine who is "talking" to render the 3D interaction bubbles properly
  const activeNodes = getActiveNodes(step)
  const isSenderSpeaking = currentLog?.startsWith('>')
  const isReceiverSpeaking = currentLog?.startsWith('<')

  // Clean log for central display
  const displayLog = currentLog?.replace(/^[><]\s*/, '')

  return (
    <div className="w-screen h-screen relative bg-[#09090b] text-zinc-100 overflow-hidden font-sans selection:bg-purple-900">
      
      {/* 3D CANVAS */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 30, 60], fov: 50 }}>
          <fog attach="fog" args={['#09090b', 20, 120]} />
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
            minDistance={2}
            maxDistance={120} 
          />
          <CameraRig step={step} controlsRef={controlsRef} />

          {/* DYNAMIC 3D COMMUNICATION BUBBLES */}
          {currentLog && (
            <Html 
              position={
                activeNodes 
                  ? (isReceiverSpeaking ? (activeNodes as any)[1] : (activeNodes as any)[0])
                  : [0, 8, 0] // Center ambient hologram position during System Idle overview
              } 
              center 
              zIndexRange={[100, 0]} 
              wrapperClass="pointer-events-none"
            >
              <div key={currentLog} className="animate-in fade-in zoom-in duration-300 slide-in-from-bottom-2 -mt-36">
                <div className={`px-5 py-4 rounded-xl backdrop-blur-xl border shadow-2xl text-sm font-mono w-max max-w-[26rem] whitespace-normal text-center leading-relaxed font-bold flex flex-col items-center gap-3 ${
                  isSenderSpeaking ? 'bg-green-950/90 border-green-700/50 text-green-300 shadow-[0_10px_30px_rgba(34,197,94,0.3)]' :
                  isReceiverSpeaking ? 'bg-blue-950/90 border-blue-700/50 text-blue-300 shadow-[0_10px_30px_rgba(59,130,246,0.3)]' :
                  'bg-zinc-950/90 border-zinc-700/50 text-zinc-300 shadow-[0_10px_30px_rgba(255,255,255,0.1)]'
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0 ${
                    isSenderSpeaking ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,1)]' : 
                    isReceiverSpeaking ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,1)]' : 
                    'bg-zinc-400'
                  }`} />
                  {displayLog}
                </div>
                {/* Speech Arrow */}
                {activeNodes && (
                  <div className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] mx-auto mt-0.5 ${
                    isSenderSpeaking ? 'border-t-green-700/50' : 
                    isReceiverSpeaking ? 'border-t-blue-700/50' :
                    'border-t-zinc-700/50'
                  }`}></div>
                )}
              </div>
            </Html>
          )}

        </Canvas>
      </div>

      {/* FLOATING TOP HEADER CONTROLS */}
      <header className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-center pointer-events-none">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 drop-shadow-md">E-Mail System Simulator</h1>
          <p className="text-zinc-300 text-sm font-medium drop-shadow-md">Deep Protocol Visualization: DNS, routing, SPF/DKIM, and IMAP</p>
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
