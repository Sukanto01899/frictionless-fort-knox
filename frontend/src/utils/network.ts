import { createNetwork } from '@stacks/network';

const networkName = import.meta.env.VITE_STACKS_NETWORK ?? 'mainnet';
const normalized = networkName === 'mainnet' ? 'mainnet' : 'testnet';

export const NETWORK = createNetwork(normalized);
export const NETWORK_LABEL = normalized === 'mainnet' ? 'Mainnet' : 'Testnet';
