import type { BridgeCallRequest } from '../callingTypes';

/**
 * Stub for POST /api/v1/telephony/bridge-call.
 * No live PBX backend exists yet — this simulates the ring/bridge latency
 * so the front-end call state machine can be built and tested independently.
 */
export async function bridgeCall(request: BridgeCallRequest): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { success: true };
}
