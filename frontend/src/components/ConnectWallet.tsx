import { useEffect, useMemo, useState } from 'react';
import {
    connectWallet,
    disconnectWallet,
    getWalletSnapshot,
    subscribeWallet,
    walletConnectConfigured,
} from '../lib/wallet';
import { NETWORK_LABEL } from '../utils/network';

const ConnectWallet = () => {
    const [walletState, setWalletState] = useState(getWalletSnapshot());
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectingProvider, setConnectingProvider] = useState<'stacks' | 'walletconnect' | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addressLabel = useMemo(() => {
        if (!walletState.connected) {
            return 'Not connected';
        }
        return walletState.stxAddress ?? 'Address unavailable';
    }, [walletState.connected, walletState.stxAddress]);

    const handleConnect = async (provider: 'stacks' | 'walletconnect') => {
        setIsConnecting(true);
        setConnectingProvider(provider);
        setError(null);
        try {
            await connectWallet(provider);
            setWalletState(getWalletSnapshot());
            setIsModalOpen(false);
        } catch (connectError) {
            console.error('Wallet connection failed:', connectError);
            setError(connectError instanceof Error ? connectError.message : 'Wallet connection failed.');
        } finally {
            setIsConnecting(false);
            setConnectingProvider(null);
        }
    };

    const handleSignOut = () => {
        disconnectWallet();
        setWalletState(getWalletSnapshot());
    };

    useEffect(() => {
        const unsubscribe = subscribeWallet(() => {
            setWalletState(getWalletSnapshot());
        });

        return unsubscribe;
    }, []);

    return (
        <section className="panel">
            <div className="panel__header">
                <span className="eyebrow">Identity</span>
                <h2>Connect Wallet</h2>
                <p className="panel__sub">Choose Stacks Connect or WalletConnect to authorize on-chain actions.</p>
            </div>
            {!walletState.connected ? (
                <div className="panel__body">
                    <button className="btn btn--primary" onClick={() => setIsModalOpen(true)} disabled={isConnecting}>
                        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                    {!walletConnectConfigured && (
                        <p className="helper-text">Add `VITE_WALLETCONNECT_PROJECT_ID` to enable WalletConnect.</p>
                    )}
                    {error && <p className="helper-text">{error}</p>}
                </div>
            ) : (
                <div className="panel__body">
                    <div className="status">
                        <span className="status__dot" />
                        Connected
                    </div>
                    <div className="kv-list">
                        <div className="kv">
                            <span>{NETWORK_LABEL}</span>
                            <span className="mono">{addressLabel}</span>
                        </div>
                    </div>
                    {NETWORK_LABEL === 'Testnet' && (
                        <a
                            className="btn btn--ghost"
                            href="https://explorer.hiro.so/sandbox/faucet?chain=testnet"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Get Testnet STX
                        </a>
                    )}
                    <button className="btn btn--ghost" onClick={handleSignOut}>
                        Sign Out
                    </button>
                </div>
            )}
            {isModalOpen && !walletState.connected && (
                <div
                    className="modal-backdrop"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Choose wallet"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div className="modal" onClick={(event) => event.stopPropagation()}>
                        <div className="modal__header">
                            <div>
                                <span className="eyebrow">Wallet</span>
                                <h3>Choose a provider</h3>
                                <p className="panel__sub">Select Stacks Connect or WalletConnect to continue.</p>
                            </div>
                            <button
                                className="btn btn--ghost btn--icon"
                                onClick={() => setIsModalOpen(false)}
                                aria-label="Close wallet selection"
                            >
                                x
                            </button>
                        </div>
                        <div className="modal__body">
                            <div className="wallet-actions">
                                <button className="btn btn--primary" onClick={() => handleConnect('stacks')} disabled={isConnecting}>
                                    {connectingProvider === 'stacks' ? 'Connecting...' : 'Connect with Stacks'}
                                </button>
                                <button
                                    className="btn btn--ghost"
                                    onClick={() => handleConnect('walletconnect')}
                                    disabled={isConnecting || !walletConnectConfigured}
                                >
                                    {connectingProvider === 'walletconnect'
                                        ? 'Connecting...'
                                        : walletConnectConfigured
                                            ? 'Connect with WalletConnect'
                                            : 'WalletConnect not configured'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ConnectWallet;
