import { useState } from 'react';
import { openContractCall } from '@stacks/connect';
import { bufferCV } from '@stacks/transactions';
import { userSession } from '../lib/stacks-auth';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../utils/contract';
import { NETWORK } from '../utils/network';

export const TransactionSender = () => {
    const [status, setStatus] = useState<string | null>(null);

    const handleSend = () => {
        const payload = new Uint8Array(128).fill(1);
        const signature = new Uint8Array(64).fill(2);

        openContractCall({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'execute-action',
            functionArgs: [bufferCV(payload), bufferCV(signature)],
            network: NETWORK,
            onFinish: (data) => {
                console.log('Finished', data);
                setStatus(`Transaction submitted: ${data.txId}`);
            },
            onCancel: () => {
                setStatus('Transaction canceled in wallet.');
            },
            userSession,
        });
    };

    if (!userSession.isUserSignedIn()) {
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
