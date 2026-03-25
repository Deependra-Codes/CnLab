import ComputerNode from './ComputerNode'
import ServerNode from './ServerNode'
import DNSNode from './DNSNode'
import RouterNode from './RouterNode'
import NetworkPath from './NetworkPath'
import NetworkPacket from './NetworkPacket'

// Quadrant-based Layout coordinates
export const POSITIONS = {
  // Quadrant 1: Sender Network (Bottom-Left)
  SENDER_MUA: [-32, -2, 14] as [number, number, number],
  SENDER_MTA: [-24, 0, 4] as [number, number, number],
  
  // Quadrant 2: DNS Hierarchy (Grounded & Spaced out)
  DNS_ROOT: [-16, 0, -18] as [number, number, number],
  DNS_TLD: [-8, 0, -14] as [number, number, number],
  DNS_AUTH: [0, 0, -10] as [number, number, number],
  
  // Quadrant 3: Backbone Exchange (Center)
  ROUTER_1: [-17, 0, -2] as [number, number, number],
  ROUTER_2: [-7, 0, -2] as [number, number, number],
  
  // Quadrant 4: Receiver Network (Bottom-Right)
  RECEIVER_MTA: [2, 0, 4] as [number, number, number],
  RECEIVER_MDA: [8, 0, 8] as [number, number, number],
  RECEIVER_MUA: [14, -2, 14] as [number, number, number]
}

export default function NetworkScene({ step }: { step: number }) {
  return (
    <group>
      {/* --- NODES --- */}
<<<<<<< HEAD
      <ComputerNode position={POSITIONS.SENDER_MUA} label="Chintu MUA" isSender={true} step={step} />
=======
      <ComputerNode position={POSITIONS.SENDER_MUA} label="Alice MUA" isSender={true} />
>>>>>>> origin/main
      <ServerNode position={POSITIONS.SENDER_MTA} label="Sender MTA Gateway" type="MTA" />
      
      {/* The DNS Hierarchy */}
      <DNSNode position={POSITIONS.DNS_ROOT} label="Root (.)" />
      <DNSNode position={POSITIONS.DNS_TLD} label="TLD (.com)" />
      <DNSNode position={POSITIONS.DNS_AUTH} label="Auth (other.com)" />

      {/* Internet Backbone */}
      <RouterNode position={POSITIONS.ROUTER_1} label="IXP Hub West" />
      <RouterNode position={POSITIONS.ROUTER_2} label="IXP Hub East" />

      <ServerNode position={POSITIONS.RECEIVER_MTA} label="Receiver MTA Gateway" type="MTA" />
      <ServerNode position={POSITIONS.RECEIVER_MDA} label="Spooling Storage" type="MDA" />
      <ComputerNode position={POSITIONS.RECEIVER_MUA} label="Bob MUA" isSender={false} />

      {/* --- STATIC WIRING (Faint lines to show the topology structure) --- */}
      <NetworkPath start={POSITIONS.SENDER_MTA} end={POSITIONS.DNS_ROOT} active={false} color="#222" />
      <NetworkPath start={POSITIONS.SENDER_MTA} end={POSITIONS.DNS_TLD} active={false} color="#222" />
      <NetworkPath start={POSITIONS.SENDER_MTA} end={POSITIONS.DNS_AUTH} active={false} color="#222" />
      <NetworkPath start={POSITIONS.SENDER_MTA} end={POSITIONS.ROUTER_1} active={false} color="#333" />
      <NetworkPath start={POSITIONS.ROUTER_1} end={POSITIONS.ROUTER_2} active={false} color="#333" />
      <NetworkPath start={POSITIONS.ROUTER_2} end={POSITIONS.RECEIVER_MTA} active={false} color="#333" />
      <NetworkPath start={POSITIONS.RECEIVER_MTA} end={POSITIONS.RECEIVER_MDA} active={false} color="#333" />

      {/* --- ACTIVE PATHS & HIGHLIGHTS --- */}
      {/* 1, 2, 3: MUA to MTA (TCP, TLS, SMTP) */}
      <NetworkPath start={POSITIONS.SENDER_MUA} end={POSITIONS.SENDER_MTA} active={step >= 1 && step <= 3} color="#3b82f6" />
      
      {/* DNS Steps */}
      <NetworkPath start={POSITIONS.SENDER_MTA} end={POSITIONS.DNS_ROOT} active={step === 4} dashed color="#06b6d4" />
      <NetworkPath start={POSITIONS.SENDER_MTA} end={POSITIONS.DNS_TLD} active={step === 5} dashed color="#06b6d4" />
      <NetworkPath start={POSITIONS.SENDER_MTA} end={POSITIONS.DNS_AUTH} active={step === 6} dashed color="#06b6d4" />
      
      {/* Routing Hops */}
      <NetworkPath start={POSITIONS.SENDER_MTA} end={POSITIONS.ROUTER_1} active={step === 7} color="#ec4899" />
      <NetworkPath start={POSITIONS.ROUTER_1} end={POSITIONS.ROUTER_2} active={step === 8} color="#ec4899" />
      <NetworkPath start={POSITIONS.ROUTER_2} end={POSITIONS.RECEIVER_MTA} active={step === 9} color="#ec4899" />
      
      {/* Receiver Checks & Spooling */}
      {/* Step 10 & 11 happening at Receiever MTA (No specific new path, just activity on the node, but we'll highlight the final backbone link) */}
      <NetworkPath start={POSITIONS.ROUTER_2} end={POSITIONS.RECEIVER_MTA} active={step === 10 || step === 11} color="#a855f7" />
      
      {/* Local Delivery */}
      <NetworkPath start={POSITIONS.RECEIVER_MTA} end={POSITIONS.RECEIVER_MDA} active={step === 12} color="#f59e0b" />
      
      {/* IMAP Fetch */}
      <NetworkPath start={POSITIONS.RECEIVER_MDA} end={POSITIONS.RECEIVER_MUA} active={step === 13} color="#10b981" />

      {/* --- ANIMATED PACKETS --- */}
      <group key={step}>
        {(step === 1 || step === 2 || step === 3) && <NetworkPacket start={POSITIONS.SENDER_MUA} end={POSITIONS.SENDER_MTA} active={true} color={step === 1 ? '#fff' : '#3b82f6'} speed={1.2} />}
        
        {step === 4 && <NetworkPacket start={POSITIONS.SENDER_MTA} end={POSITIONS.DNS_ROOT} active={true} color="#06b6d4" speed={2.0} />}
        {step === 5 && <NetworkPacket start={POSITIONS.SENDER_MTA} end={POSITIONS.DNS_TLD} active={true} color="#06b6d4" speed={2.0} />}
        {step === 6 && <NetworkPacket start={POSITIONS.SENDER_MTA} end={POSITIONS.DNS_AUTH} active={true} color="#06b6d4" speed={2.0} />}
        
        {step === 7 && <NetworkPacket start={POSITIONS.SENDER_MTA} end={POSITIONS.ROUTER_1} active={true} color="#ec4899" speed={1.5} />}
        {step === 8 && <NetworkPacket start={POSITIONS.ROUTER_1} end={POSITIONS.ROUTER_2} active={true} color="#ec4899" speed={0.8} />}
        {step === 9 && <NetworkPacket start={POSITIONS.ROUTER_2} end={POSITIONS.RECEIVER_MTA} active={true} color="#ec4899" speed={1.5} />}
        
        {/* Step 10/11 packet bouncing inside MTA visually */}
        {(step === 10 || step === 11) && <NetworkPacket start={POSITIONS.ROUTER_2} end={POSITIONS.RECEIVER_MTA} active={true} color="#a855f7" speed={0.5} />}

        {step === 12 && <NetworkPacket start={POSITIONS.RECEIVER_MTA} end={POSITIONS.RECEIVER_MDA} active={true} color="#f59e0b" speed={1.2} />}
        {step === 13 && <NetworkPacket start={POSITIONS.RECEIVER_MDA} end={POSITIONS.RECEIVER_MUA} active={true} color="#10b981" speed={0.8} />}
      </group>

      {/* Ground Decoration (Larger Grid for larger scene) */}
      <gridHelper args={[150, 150, '#a855f7', '#111']} position={[0, -2.5, 0]} />
      {/* Sub-grid for visual density */}
      <gridHelper args={[150, 300, '#222', '#050505']} position={[0, -2.51, 0]} />
    </group>
  )
}
