import ComputerNode from './ComputerNode'
import ServerNode from './ServerNode'
import DNSNode from './DNSNode'
import NetworkPath from './NetworkPath'
import NetworkPacket from './NetworkPacket'

// Layout coordinates
const POSITIONS = {
  SENDER_MUA: [-5, 0, 3] as [number, number, number],
  SENDER_MTA: [-2.5, 0, -2] as [number, number, number],
  DNS: [0, 2, -4] as [number, number, number],
  RECEIVER_MTA: [2.5, 0, -2] as [number, number, number],
  RECEIVER_MDA: [4.5, 0, -4] as [number, number, number],
  RECEIVER_MUA: [5, 0, 3] as [number, number, number]
}

export default function NetworkScene({ step }: { step: number }) {
  return (
    <group>
      {/* --- NODES --- */}
      <ComputerNode position={POSITIONS.SENDER_MUA} label="Alice" isSender={true} />
      <ServerNode position={POSITIONS.SENDER_MTA} label="Sender Mail Server" type="MTA" />
      
      <DNSNode position={POSITIONS.DNS} />

      <ServerNode position={POSITIONS.RECEIVER_MTA} label="Receiver Mail Server" type="MTA" />
      <ServerNode position={POSITIONS.RECEIVER_MDA} label="Mailbox Storage" type="MDA" />
      <ComputerNode position={POSITIONS.RECEIVER_MUA} label="Bob" isSender={false} />

      {/* --- PATHS --- */}
      {/* 1. SMTP Submission */}
      <NetworkPath start={POSITIONS.SENDER_MUA} end={POSITIONS.SENDER_MTA} active={step === 1} color="#3b82f6" />
      
      {/* 2. DNS Lookup */}
      <NetworkPath start={POSITIONS.SENDER_MTA} end={POSITIONS.DNS} active={step === 2} dashed color="#06b6d4" />
      
      {/* 3. SMTP Transfer */}
      <NetworkPath start={POSITIONS.SENDER_MTA} end={POSITIONS.RECEIVER_MTA} active={step >= 3 && step <= 4} color="#a855f7" />
      
      {/* 4. Delivery */}
      <NetworkPath start={POSITIONS.RECEIVER_MTA} end={POSITIONS.RECEIVER_MDA} active={step === 5} color="#f59e0b" />
      
      {/* 5. IMAP Fetch */}
      <NetworkPath start={POSITIONS.RECEIVER_MDA} end={POSITIONS.RECEIVER_MUA} active={step === 6} color="#10b981" />

      {/* --- PACKETS --- */}
      <group key={step}>
        {step === 1 && <NetworkPacket start={POSITIONS.SENDER_MUA} end={POSITIONS.SENDER_MTA} active={true} color="#3b82f6" speed={1.2} />}
        {step === 2 && <NetworkPacket start={POSITIONS.SENDER_MTA} end={POSITIONS.DNS} active={true} color="#06b6d4" speed={2.0} />}
        {(step === 3 || step === 4) && <NetworkPacket start={POSITIONS.SENDER_MTA} end={POSITIONS.RECEIVER_MTA} active={true} color="#a855f7" speed={0.8} />}
        {step === 5 && <NetworkPacket start={POSITIONS.RECEIVER_MTA} end={POSITIONS.RECEIVER_MDA} active={true} color="#f59e0b" speed={1.5} />}
        {step === 6 && <NetworkPacket start={POSITIONS.RECEIVER_MDA} end={POSITIONS.RECEIVER_MUA} active={true} color="#10b981" speed={1.5} />}
      </group>

      {/* Ground Decoration */}
      <gridHelper args={[30, 30, '#aa3bff', '#1f1f2e']} position={[0, -1, 0]} />
    </group>
  )
}
