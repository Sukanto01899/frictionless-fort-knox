import { useEffect, useState } from 'react';
import { bufferCV } from '@stacks/transactions';
import { callContract, getWalletSnapshot, subscribeWallet } from '../lib/wallet';
import { generateP256KeyPair, bufferToHex } from '../utils/crypto';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../utils/contract';

const InitializeWallet = () => {
    const [isInitializing, setIsInitializing] = useState(false);
    const [txId, setTxId] = useState<string | null>(null);
    const [pubKeyHex, setPubKeyHex] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [walletState, setWalletState] = useState(getWalletSnapshot());

    useEffect(() => {
        const unsubscribe = subscribeWallet(() => {
            setWalletState(getWalletSnapshot());
        });

        return unsubscribe;
    }, []);

    const handleInitialize = async () => {
        setIsInitializing(true);
        setError(null);
        setTxId(null);
        setPubKeyHex(null);
        try {
            // Generate a fresh P-256 key pair
            // In a real app, this would be stored securely or derived from WebAuthn
            const { publicKey } = await generateP256KeyPair();

            const publicKeyHex = bufferToHex(publicKey);
            setPubKeyHex(publicKeyHex);

            const functionArgs = [
                bufferCV(publicKey)
            ];

            // Inspect Clarinet.toml to get standard deployer address for devnet if possible,
            // or assume standard `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM` 
            // and contract name `v3-frictionless-fort-knox`
            const functionName = 'initialize';

            const response = await callContract({
                contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
                functionName,
                functionArgs,
            });

            const txid = 'txid' in response ? response.txid : undefined;
            setTxId(txid ?? null);
            setIsInitializing(false);

        } catch (error) {
            console.error('Initialization failed:', error);
            setError('Initialization failed. Check your wallet connection and try again.');
            setIsInitializing(false);
        }
    };

    if (!walletState.connected) {
        return (
            <section className="panel panel--disabled">
                <div className="panel__header">
                    <span className="eyebrow">Wallet</span>
                    <h2>Initialize</h2>
                    <p className="panel__sub">Connect a wallet to generate and store your biometric key.</p>
                </div>
                <button className="btn btn--ghost" disabled>
                    Connect wallet to continue
                </button>
            </section>
        );
    }

    return (
        <section className="panel">
            <div className="panel__header">
                <span className="eyebrow">Wallet</span>
                <h2>Initialize</h2>
                <p className="panel__sub">Generate a P-256 key pair and register the public key on-chain.</p>
            </div>

            <div className="panel__body">
                <button className="btn btn--primary" onClick={handleInitialize} disabled={isInitializing}>
                    {isInitializing ? 'Initializing...' : 'Initialize Wallet'}
                </button>

                {pubKeyHex && (
                    <div className="tx-pill">
                        <span>Public Key</span>
                        <span className="mono">{pubKeyHex}</span>
                    </div>
                )}

                {txId && (
                    <div className="tx-pill">
                        <span>Transaction</span>
                        <span className="mono">{txId}</span>
                    </div>
                )}

                {error && <p className="helper-text">{error}</p>}
            </div>
        </section>
    );
};

export default InitializeWallet;
