export interface GoogleBridgeClientConfig {
  gasWebAppUrl?: string | null;
  serverConfigured?: boolean;
  preferBridge?: boolean;
}

let bridgeConfig: GoogleBridgeClientConfig = {
  gasWebAppUrl: null,
  serverConfigured: false,
  preferBridge: true,
};

export const BRIDGE_TOKEN_SENTINEL = 'BRIDGE_MODE';

export const setGoogleBridgeConfig = (config: GoogleBridgeClientConfig) => {
  bridgeConfig = {
    ...bridgeConfig,
    ...config,
  };
};

export const getGoogleBridgeConfig = (): GoogleBridgeClientConfig => bridgeConfig;

export const isBridgeToken = (accessToken?: string | null): boolean => {
  return !accessToken || accessToken === BRIDGE_TOKEN_SENTINEL;
};

export const shouldUseBridge = (accessToken?: string | null): boolean => {
  if (!accessToken || accessToken === BRIDGE_TOKEN_SENTINEL) {
    return true;
  }
  return Boolean(bridgeConfig.preferBridge && (bridgeConfig.gasWebAppUrl || bridgeConfig.serverConfigured));
};

export interface BridgeCallResult<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  errorCode?: string;
}

export const callGoogleBridge = async <T = any>(
  action: string,
  payload: Record<string, any> = {},
  gasWebAppUrlOverride?: string | null
): Promise<BridgeCallResult<T>> => {
  const res = await fetch('/api/google-bridge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      payload,
      gasWebAppUrl: gasWebAppUrlOverride !== undefined ? gasWebAppUrlOverride : bridgeConfig.gasWebAppUrl || undefined,
    }),
  });

  const rawText = await res.text();
  let parsed: any = {};
  try {
    parsed = rawText ? JSON.parse(rawText) : {};
  } catch {
    const snippet = rawText && !rawText.trim().startsWith('<') ? rawText.trim().slice(0, 200) : '';
    parsed = {
      ok: false,
      status: res.status,
      error: snippet ? `HTTP ${res.status}: ${snippet}` : `HTTP ${res.status}`,
    };
  }

  return {
    ok: Boolean(res.ok && parsed.ok),
    status: Number(parsed.status || res.status || 500),
    data: parsed.data as T,
    error: parsed.error,
    errorCode: parsed.errorCode,
  };
};

export const pingGoogleBridge = async (gasWebAppUrlOverride?: string | null) => {
  const result = await callGoogleBridge<{ message?: string }>('ping', {}, gasWebAppUrlOverride);
  if (!result.ok) {
    throw new Error(result.error || `Bridge ping failed (HTTP ${result.status})`);
  }
  return result.data;
};
