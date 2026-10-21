import { HuaweiAdapter } from './HuaweiAdapter';
import { MockAdapter } from './MockAdapter';

export const COMMON_GATEWAYS = ['192.168.8.1', '192.168.0.1', '192.168.1.1'];

/**
 * RouterService coordinates adapter auto-detection, gateway probing,
 * and delegates monitoring and management commands to the active brand adapter.
 */
class RouterService {
  constructor() {
    this.adapter = null;
    this.isDetecting = false;
    this.isMockMode = false;
    this.detectedGateway = null;
    this.lastError = null;
  }

  /**
   * Probe a single IP to test if it's reachable and identify if it speaks Huawei HiLink API
   * @param {string} ip
   * @returns {Promise<{ isOnline: boolean, isHuawei: boolean }>}
   */
  async probeGateway(ip, timeoutMs = 2000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // 1. Try Huawei HiLink token endpoint first (fastest identification for MiFi devices)
      const tokenUrl = `http://${ip}/api/webserver/token`;
      const tokenRes = await fetch(tokenUrl, {
        method: 'GET',
        signal: controller.signal,
      }).catch(() => null);

      if (tokenRes && tokenRes.ok) {
        const text = await tokenRes.text();
        if (text.includes('<response>') || text.includes('<token>')) {
          clearTimeout(timer);
          return { isOnline: true, isHuawei: true };
        }
      }

      // 2. Try Huawei monitoring status endpoint
      const statusUrl = `http://${ip}/api/monitoring/status`;
      const statusRes = await fetch(statusUrl, {
        method: 'GET',
        signal: controller.signal,
      }).catch(() => null);

      if (statusRes && (statusRes.ok || statusRes.status === 403 || statusRes.status === 401)) {
        clearTimeout(timer);
        return { isOnline: true, isHuawei: true };
      }

      // 3. Fallback: General HTTP probe
      const rootRes = await fetch(`http://${ip}/`, {
        method: 'GET',
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timer);
      if (rootRes) {
        const body = await rootRes.text().catch(() => '');
        const isHuawei = body.toLowerCase().includes('huawei') || body.toLowerCase().includes('hilink');
        return { isOnline: true, isHuawei };
      }

      return { isOnline: false, isHuawei: false };
    } catch {
      clearTimeout(timer);
      return { isOnline: false, isHuawei: false };
    }
  }

  /**
   * Auto-detection routine:
   * Pings common gateways (192.168.8.1, 192.168.0.1, 192.168.1.1).
   * Dynamically instantiates the correct adapter (e.g. HuaweiAdapter).
   */
  async detectRouter(customIp = null) {
    this.isDetecting = true;
    this.lastError = null;

    if (this.isMockMode) {
      this.adapter = new MockAdapter();
      this.isDetecting = false;
      return { success: true, adapter: this.adapter, isMock: true };
    }

    const gatewaysToScan = customIp ? [customIp, ...COMMON_GATEWAYS] : COMMON_GATEWAYS;

    // Remove duplicates while keeping order
    const uniqueGateways = Array.from(new Set(gatewaysToScan));

    for (const ip of uniqueGateways) {
      try {
        const probeResult = await this.probeGateway(ip);
        if (probeResult.isOnline) {
          this.detectedGateway = ip;
          if (probeResult.isHuawei || ip === '192.168.8.1') {
            this.adapter = new HuaweiAdapter(ip);
            await this.adapter.authenticate().catch(() => {});
            this.isDetecting = false;
            return { success: true, adapter: this.adapter, brand: 'Huawei', gateway: ip };
          }

          // Generic fallback for other routers (defaulting to HuaweiAdapter structure)
          this.adapter = new HuaweiAdapter(ip);
          this.isDetecting = false;
          return { success: true, adapter: this.adapter, brand: 'Generic/Huawei', gateway: ip };
        }
      } catch (err) {
        console.warn(`Failed probing gateway ${ip}:`, err.message);
      }
    }

    this.isDetecting = false;

    // If no physical router was detected on the current local network,
    // prepare a default HuaweiAdapter ready for when device reconnects,
    // but inform caller so they can decide or enable Mock Mode.
    this.adapter = new HuaweiAdapter('192.168.8.1');
    return {
      success: false,
      adapter: this.adapter,
      message: 'No active MiFi gateway detected at 192.168.8.1, 192.168.0.1, or 192.168.1.1',
    };
  }

  /**
   * Toggle simulated / demo mode for testing in Expo Go without physical hardware
   */
  setMockMode(enable) {
    this.isMockMode = enable;
    if (enable) {
      this.adapter = new MockAdapter();
    } else {
      this.adapter = new HuaweiAdapter(this.detectedGateway || '192.168.8.1');
    }
    return this.adapter;
  }

  /**
   * Directly set or change the adapter
   */
  setAdapter(adapter) {
    this.adapter = adapter;
  }

  getAdapter() {
    if (!this.adapter) {
      this.adapter = new HuaweiAdapter('192.168.8.1');
    }
    return this.adapter;
  }

  // Delegated methods
  async getStatus() {
    return this.getAdapter().getStatus();
  }

  async getDeviceInfo() {
    return this.getAdapter().getDeviceInfo();
  }

  async getWifiCredentials() {
    return this.getAdapter().getWifiCredentials();
  }
}

// Export singleton instance
export const routerService = new RouterService();
export default routerService;
