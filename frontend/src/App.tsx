import './App.css'
import ConnectWallet from './components/ConnectWallet'
import InitializeWallet from './components/InitializeWallet'
import { TransactionSender } from './components/TransactionSender'
import ChainhookActivity from './components/ChainhookActivity'
import { CONTRACT_ADDRESS, CONTRACT_NAME } from './utils/contract'
import { NETWORK_LABEL } from './utils/network'

function App() {
  return (
    <div className="app">
      <div className="glow glow--one" />
      <div className="glow glow--two" />

      <header className="topbar">
        <div className="brand">
          <div className="brand__mark">FFK</div>
          <div>
            <p className="brand__name">Frictionless Fort Knox</p>
            <p className="brand__tag">Seedless Smart Wallet</p>
          </div>
        </div>
        <div className="network-pill">
          <span className="dot" />
          {NETWORK_LABEL} ready
        </div>
      </header>

      <main className="main">
        <section className="hero reveal">
          <div className="hero__copy">
            <span className="eyebrow">Clarity 4 • secp256r1 • Secure Enclave</span>
            <h1 className="hero__title">Seedless security with a biometric heartbeat.</h1>
            <p className="hero__lead">
              Store your device public key on-chain, verify signatures inside the contract,
              and keep private keys locked in hardware. Fast onboarding, zero seed phrases.
            </p>
            <div className="hero__stats">
              <div className="stat">
                <span className="stat__value">33-byte</span>
                <span className="stat__label">Device key</span>
              </div>
              <div className="stat">
                <span className="stat__value">Nonce</span>
                <span className="stat__label">Replay guard</span>
              </div>
              <div className="stat">
                <span className="stat__value">On-chain</span>
                <span className="stat__label">Verification</span>
              </div>
            </div>
          </div>

          <div className="panel hero__panel">
            <div className="panel__header">
              <span className="eyebrow">Contract Setup</span>
              <h2>{CONTRACT_NAME}</h2>
              <p className="panel__sub">Configure the network address once, then initialize with a device key.</p>
            </div>
            <div className="kv-list">
              <div className="kv">
                <span>Address</span>
                <span className="mono">{CONTRACT_ADDRESS}</span>
              </div>
              <div className="kv">
                <span>Name</span>
                <span className="mono">{CONTRACT_NAME}</span>
              </div>
              <div className="kv">
                <span>Clarity</span>
                <span>Version 4</span>
              </div>
              <div className="kv">
                <span>Epoch</span>
                <span>3.3</span>
              </div>
            </div>
            <div className="callout">
              Initialize once with a compressed P-256 public key (`0x02...` or `0x03...`).
            </div>
          </div>
        </section>

        <section className="action-grid reveal reveal--delay">
          <ConnectWallet />
          <InitializeWallet />
          <TransactionSender />
          <ChainhookActivity />
        </section>
      </main>
    </div>
  )
}

export default App
