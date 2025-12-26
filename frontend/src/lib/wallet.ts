import type { MethodParams } from '@stacks/connect';
import {
  WalletConnect,
  connect,
  disconnect,
  getLocalStorage,
  isConnected,
  request,
} from '@stacks/connect';
import { NETWORK_NAME } from '../utils/network';

const WALLET_EVENT = 'ffk:wallet-change';
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

export type WalletProvider = 'stacks' | 'walletconnect';

export const walletConnectConfigured = Boolean(walletConnectProjectId);

export function getWalletSnapshot() {
  const data = getLocalStorage();
  const stxAddress = data?.addresses?.stx?.[0]?.address ?? null;

  return {
    connected: isConnected(),
    stxAddress,
  };
}

export function subscribeWallet(listener: () => void) {
  window.addEventListener(WALLET_EVENT, listener);
  return () => window.removeEventListener(WALLET_EVENT, listener);
}

function notifyWalletChanged() {
  window.dispatchEvent(new Event(WALLET_EVENT));
}

export async function connectWallet(provider: WalletProvider) {
  if (provider === 'walletconnect') {
    if (!walletConnectProjectId) {
      throw new Error('WalletConnect project ID is missing.');
    }

    const response = await connect({
      network: NETWORK_NAME,
      walletConnect: {
        projectId: walletConnectProjectId,
        networks: [WalletConnect.Networks.Stacks],
      },
      approvedProviderIds: ['WalletConnectProvider'],
    });

    notifyWalletChanged();
    return response;
  }

  const response = await connect({ network: NETWORK_NAME });
  notifyWalletChanged();
  return response;
}

export function disconnectWallet() {
  disconnect();
  notifyWalletChanged();
}

export async function callContract(options: {
  contract: string;
  functionName: string;
  functionArgs?: MethodParams<'stx_callContract'>['functionArgs'];
}) {
  const response = await request('stx_callContract', {
    contract: options.contract,
    functionName: options.functionName,
    functionArgs: options.functionArgs,
    network: NETWORK_NAME,
  });

  return response;
}
