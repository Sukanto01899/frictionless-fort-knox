
import type { ChainhookDefinition, ChainhookNetwork } from '@hirosystems/chainhooks-client';

export type ChainhookActivityItem = {
    id: string;
    txid: string;
    sender: string;
    contractIdentifier: string;
    functionName: string;
    blockHeight: number;
    timestamp: number;
};

export const CHAINHOOK_EVENTS_PATH = '/chainhook-events.json';

export const buildFortKnoxChainhookDefinition = (params: {
    webhookUrl: string;
    network: ChainhookNetwork;
    contractIdentifier: string;
    name?: string;
}): ChainhookDefinition => {
    return {
        name: params.name ?? 'Fort Knox Action Monitor',
        version: '1',
        chain: 'stacks',
        network: params.network,
        filters: {
            events: [
                {
                    type: 'contract_call',
                    contract_identifier: params.contractIdentifier,
                    function_name: 'execute-action',
                },
            ],
        },
        options: {
            enable_on_registration: true,
            decode_clarity_values: true,
            include_block_metadata: true,
        },
        action: {
            type: 'http_post',
            url: params.webhookUrl,
        },
    };
};
