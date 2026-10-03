import { Linking } from 'react-native';

import type { BridgeCallRequest, CallProviderMode } from '../callingTypes';
import { bridgeCall } from './callingApi';

export interface CallProviderResult {
  success: boolean;
  mode: CallProviderMode;
  error?: string;
}

async function callViaIptspBridge(request: BridgeCallRequest): Promise<CallProviderResult> {
  const result = await bridgeCall(request);
  return { success: result.success, mode: 'IPTSP_BRIDGE' };
}

/**
 * Opens the device's native phone dialer pre-filled with a raw number.
 * Only usable for leads that carry a `rawPhoneNumber` (i.e. leads the agent
 * typed in themselves) — masked investor-database leads never expose one,
 * by design, so this path intentionally fails closed for them.
 */
async function callViaNativeSim(rawPhoneNumber?: string): Promise<CallProviderResult> {
  if (!rawPhoneNumber) {
    return {
      success: false,
      mode: 'NATIVE_SIM',
      error: 'This lead has no dialable number in Native SIM mode. Masked leads require IPTSP Bridge.',
    };
  }

  const url = `tel:${rawPhoneNumber}`;
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    return { success: false, mode: 'NATIVE_SIM', error: 'Unable to open the native dialer.' };
  }

  await Linking.openURL(url);
  return { success: true, mode: 'NATIVE_SIM' };
}

export async function placeCall(params: {
  mode: CallProviderMode;
  request: BridgeCallRequest;
  rawPhoneNumber?: string;
}): Promise<CallProviderResult> {
  if (params.mode === 'NATIVE_SIM') {
    return callViaNativeSim(params.rawPhoneNumber);
  }
  return callViaIptspBridge(params.request);
}
