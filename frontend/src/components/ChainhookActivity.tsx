import { useEffect, useState } from 'react';
import { CHAINHOOK_EVENTS_PATH, type ChainhookActivityItem } from '../lib/chainhooks';

const POLL_INTERVAL_MS = 8000;

const ChainhookActivity = () => {
    const [events, setEvents] = useState<ChainhookActivityItem[]>([]);
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('loading');

    useEffect(() => {
        let cancelled = false;
        let timer: number | undefined;

        const loadEvents = async () => {
            try {
                const response = await fetch(CHAINHOOK_EVENTS_PATH, { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error('Failed to load chainhook events');
                }
                const data = (await response.json()) as ChainhookActivityItem[];
                if (!cancelled) {
                    setEvents(Array.isArray(data) ? data : []);
                    setStatus('idle');
                }
            } catch (error) {
                if (!cancelled) {
                    setStatus('error');
                }
            } finally {
                if (!cancelled) {
                    timer = window.setTimeout(loadEvents, POLL_INTERVAL_MS);
                }
            }
        };

        loadEvents();

        return () => {
            cancelled = true;
            if (timer) {
                window.clearTimeout(timer);
            }
        };
    }, []);

    return (
        <section className="panel">
            <div className="panel__header">
                <span className="eyebrow">Chainhook Activity</span>
                <h2>Action Ledger</h2>
                <p className="panel__sub">
                    Live contract-call alerts for the Fort Knox execute-action flow.
                </p>
            </div>
            {status === 'error' ? (
                <div className="panel__body">
                    <p className="helper-text">
                        Chainhook feed is offline. Start the demo webhook server to stream events.
                    </p>
                </div>
            ) : events.length === 0 ? (
                <div className="panel__body">
                    <p className="helper-text">
                        No activity yet. Trigger execute-action and watch events land here.
                    </p>
                </div>
            ) : (
                <div className="panel__body">
                    <div className="activity-list">
                        {events.map((event) => (
                            <div className="activity" key={event.id}>
                                <div className="activity__row">
                                    <span className="activity__label">Function</span>
                                    <span className="activity__value">{event.functionName}</span>
                                </div>
                                <div className="activity__row">
                                    <span className="activity__label">Sender</span>
                                    <span className="mono">{event.sender}</span>
                                </div>
                                <div className="activity__row">
                                    <span className="activity__label">Tx</span>
                                    <span className="mono">{event.txid}</span>
                                </div>
                                <div className="activity__row">
                                    <span className="activity__label">Block</span>
                                    <span className="activity__value">#{event.blockHeight}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default ChainhookActivity;
