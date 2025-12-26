import { useEffect, useState } from 'react';
import { bufferCV } from '@stacks/transactions';
import { callContract, getWalletSnapshot, subscribeWallet } from '../lib/wallet';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../utils/contract';

export const TransactionSender = () => {
    const [status, setStatus] = useState<string | null>(null);
    const [walletState, setWalletState] = useState(getWalletSnapshot());

    useEffect(() => {
        const unsubscribe = subscribeWallet(() => {
            setWalletState(getWalletSnapshot());
        });

        return unsubscribe;
    }, []);

    const handleSend = async () => {
        setStatus(null);
        const payload = new Uint8Array(128).fill(1);
        const signature = new Uint8Array(64).fill(2);

        try {
            const response = await callContract({
                contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
                functionName: 'execute-action',
                functionArgs: [bufferCV(payload), bufferCV(signature)],
            });
            const txid = 'txid' in response ? response.txid : undefined;
            setStatus(txid ? `Transaction submitted: ${txid}` : 'Transaction submitted.');
        } catch (error) {
            console.error('Contract call failed:', error);
            setStatus('Transaction canceled in wallet.');
        }
    };

    if (!walletState.connected) {
        return (
            <section className="panel panel--disabled">
                <div className="panel__header">
                    <span className="eyebrow">Action</span>
                    <h2>Execute</h2>
                    <p className="panel__sub">Sign in to send a demo execute-action call.</p>
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
                <span className="eyebrow">Action</span>
                <h2>Execute</h2>
                <p className="panel__sub">Demo call with placeholder payload and signature buffers.</p>
            </div>
            <div className="panel__body">
                <button className="btn btn--primary" onClick={handleSend}>
                    Send Demo Action
                </button>
                <p className="helper-text">Replace payload/signature with real biometric signing in production.</p>
                {status && <p className="helper-text">{status}</p>}
            </div>
        </section>
    );
};
