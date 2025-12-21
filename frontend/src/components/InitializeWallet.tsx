import { useState } from 'react';
import { openContractCall } from '@stacks/connect';
import { bufferCV } from '@stacks/transactions';
import { userSession } from '../lib/stacks-auth';
import { generateP256KeyPair, bufferToHex } from '../utils/crypto';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../utils/contract';
import { NETWORK } from '../utils/network';

const InitializeWallet = () => {
    // Removed unused hook
    const [isInitializing, setIsInitializing] = useState(false);
    const [txId, setTxId] = useState<string | null>(null);
    const [pubKeyHex, setPubKeyHex] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleInitialize = async () => {
        setIsInitializing(true);
        setError(null);
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
            // and contract name `frictionless-fort-knox`
            const functionName = 'initialize';

            await openContractCall({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName,
                functionArgs,
                network: NETWORK,
                onFinish: (data) => {
                    console.log('Transaction finished:', data);
                    setTxId(data.txId);
                    setIsInitializing(false);
                },
                onCancel: () => {
                    console.log('Transaction canceled');
                    setError('Transaction canceled in wallet.');
                    setIsInitializing(false);
                },
                userSession,
            });

        } catch (error) {
            console.error('Initialization failed:', error);
            setError('Initialization failed. Check your wallet connection and try again.');
            setIsInitializing(false);
        }
    };

    if (!userSession.isUserSignedIn()) {
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
