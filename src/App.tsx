import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import NetworkScene from './components/NetworkScene'
import { useState, useEffect, useRef } from 'react'

const SIMULATION_STEPS = [
  { id: 0, name: "Idle", logs: ["System initialized.", "Waiting for Alice to compose an email..."] },
  { id: 1, name: "SMTP Submission", logs: ["Alice MUA -> Sender MTA (Port 587)", "> EHLO alice-pc", "> MAIL FROM:<alice@domain.com>", "> RCPT TO:<bob@other.com>", "< 250 OK"] },
  { id: 2, name: "DNS Lookup", logs: ["Sender MTA -> DNS Server (Port 53)", "> Query: MX record for 'other.com'", "< Answer: mail.other.com (Priority 10)"] },
  { id: 3, name: "SMTP Transfer", logs: ["Sender MTA -> Receiver MTA (Port 25)", "> Connecting to mail.other.com...", "> EHLO mail.domain.com", "> MAIL FROM:<alice@domain.com>", "> RCPT TO:<bob@other.com>", "< 250 OK"] },
  { id: 4, name: "SMTP Data Transmission", logs: ["> DATA", "> Subject: Hello Bob!", "> This is a test message.", "> .", "< 250 Message accepted for delivery", "> QUIT", "< 221 Bye"] },
  { id: 5, name: "Local MDA Delivery", logs: ["Receiver MTA -> Receiver MDA", "Routing to local mailbox for user 'bob'", "Saved object to /var/spool/mail/bob"] },
  { id: 6, name: "IMAP Fetch", logs: ["Bob MUA -> Receiver MDA (Port 993)", "> LOGIN bob ********", "< A01 OK LOGIN completed", "> A02 SELECT INBOX", "< * 1 EXISTS", "> A03 FETCH 1 (BODY.PEEK[])", "< * 1 FETCH (BODY[] {45} ...)", "> A04 LOGOUT"] },
]

function App() {
  const [step, setStep] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentStepData = SIMULATION_STEPS[step]
    if (!currentStepData) return
    
    let i = 0
    setLogs([`--- STEP ${step}: ${currentStepData.name} ---`])
    
    const interval = setInterval(() => {
      if (i < currentStepData.logs.length) {
        setLogs(prev => [...prev, currentStepData.logs[i]])
        i++
      } else {
        clearInterval(interval)
      }
    }, 600) // Append a log every 600ms for visual effect
    
    return () => clearInterval(interval)
  }, [step])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className="w-screen h-screen relative bg-[#09090b] text-zinc-100 overflow-hidden font-sans flex flex-col selection:bg-purple-900">
      
      {/* HEADER CONTROLS */}
      <header className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-center bg-gradient-to-b from-[#09090b]/80 to-transparent pointer-events-none">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 drop-shadow-md">E-Mail System Simulator</h1>
          <p className="text-zinc-300 text-sm font-medium">SMTP, DNS, IMAP Protocols Visualization</p>
        </div>
        <div className="flex gap-4 pointer-events-auto items-center">
          <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            Step {step} / {SIMULATION_STEPS.length - 1}
          </span>
          <button 
            disabled={step === 0}
            onClick={() => setStep(s => Math.max(0, s - 1))}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm transition-colors border border-zinc-700 cursor-pointer font-medium">
            Previous Step
          </button>
          <button 
            disabled={step === SIMULATION_STEPS.length - 1}
            onClick={() => setStep(s => Math.min(SIMULATION_STEPS.length - 1, s + 1))}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none rounded-md text-sm transition-all shadow-[0_0_15px_rgba(147,51,234,0.4)] cursor-pointer font-bold tracking-wide">
            {step === SIMULATION_STEPS.length - 1 ? 'Simulation Complete' : 'Next Step'}
          </button>
        </div>
      </header>

      {/* 3D CANVAS */}
      <div className="flex-1 w-full h-full">
        <Canvas camera={{ position: [0, 8, 12], fov: 50 }}>
          <color attach="background" args={['#09090b']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 15, 10]} intensity={1.5} />
          <pointLight position={[-10, 5, -10]} intensity={0.5} color="#aa3bff" />
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
          
          <NetworkScene step={step} />
          
          <OrbitControls 
            makeDefault 
            enableDamping 
            dampingFactor={0.05} 
            maxPolarAngle={Math.PI / 2 - 0.05} // Don't go below ground
            minDistance={5}
            maxDistance={30}
          />
        </Canvas>
      </div>

      {/* TERMINAL OVERLAY */}
      <div className="absolute right-6 top-32 bottom-8 w-[26rem] rounded-xl border border-zinc-800 bg-[#0c0c10]/90 backdrop-blur-xl overflow-hidden flex flex-col pointer-events-auto shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="px-4 py-3 bg-[#13131a] border-b border-zinc-800 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-xs text-zinc-400 font-mono tracking-wider uppercase font-bold">Protocol Log / Terminal</span>
        </div>
        <div className="flex-1 p-5 font-mono text-sm overflow-y-auto flex flex-col gap-2 relative">
          {logs.map((log, idx) => (
            <div 
              key={idx} 
              className={`animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                log.startsWith('---') ? 'text-purple-400 font-bold mt-2 mb-1' :
                log.startsWith('>') ? 'text-green-400 pl-2 border-l-2 border-green-500/30' :
                log.startsWith('<') ? 'text-blue-400 pl-2 border-l-2 border-blue-500/30' :
                'text-zinc-300'
              }`}
            >
              {log}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>

    </div>
  )
}

export default App
