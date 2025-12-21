import { useState, useEffect } from 'react';
import { userSession, authenticate } from '../lib/stacks-auth';
import { NETWORK_LABEL } from '../utils/network';

// Configure the app with permissions
// Removed local appConfig
// Create a UserSession object
// Removed local userSession

const ConnectWallet = () => {
    const [userData, setUserData] = useState<any>(null);

    const handleConnect = () => {
        authenticate();
    };

    const handleSignOut = () => {
        userSession.signUserOut();
        setUserData(null);
    };

    useEffect(() => {
        let cancelled = false;

        const hydrateSession = async () => {
            if (userSession.isSignInPending()) {
                await userSession.handlePendingSignIn();
            }

            if (!cancelled && userSession.isUserSignedIn()) {
                setUserData(userSession.loadUserData());
            }
        };

        hydrateSession();

        return () => {
            cancelled = true;
        };
    }, []);

    const addresses = userData?.profile?.stxAddress;

    return (
        <section className="panel">
            <div className="panel__header">
                <span className="eyebrow">Identity</span>
                <h2>Connect Wallet</h2>
                <p className="panel__sub">Link your Stacks account to authorize on-chain actions.</p>
            </div>
            {!userData ? (
                <button className="btn btn--primary" onClick={handleConnect}>
                    Connect Wallet
                </button>
            ) : (
                <div className="panel__body">
                    <div className="status">
                        <span className="status__dot" />
                        Connected
                    </div>
                    <div className="kv-list">
                        <div className="kv">
                            <span>{NETWORK_LABEL}</span>
                            <span className="mono">
                                {NETWORK_LABEL === 'Mainnet' ? addresses?.mainnet ?? 'Unavailable' : addresses?.testnet ?? 'Unavailable'}
                            </span>
                        </div>
                        <div className="kv">
                            <span>{NETWORK_LABEL === 'Mainnet' ? 'Testnet' : 'Mainnet'}</span>
                            <span className="mono">
                                {NETWORK_LABEL === 'Mainnet' ? addresses?.testnet ?? 'Unavailable' : addresses?.mainnet ?? 'Unavailable'}
                            </span>
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
        </section>
    );
};

export default ConnectWallet;
