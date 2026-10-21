/**
 * Base abstract class for Router Adapters.
 * Follows the Adapter Pattern to normalize different MiFi/router brands
 * into a consistent interface for the application.
 */
export class RouterAdapter {
  constructor(gatewayIp) {
    this.gatewayIp = gatewayIp;
    this.name = 'BaseRouter';
    this.token = null;
    this.sessionId = null;
  }

  /**
   * Initialize or authenticate with the router (e.g. acquire CSRF/session tokens)
   * @returns {Promise<boolean>}
   */
  async authenticate() {
    throw new Error('authenticate() must be implemented by adapter subclass');
  }

  /**
   * Fetch current real-time monitoring status
   * @returns {Promise<{
   *   batteryPercent: number,
   *   isCharging: boolean,
   *   simStatus: 'ready' | 'missing' | 'pin_required' | 'error',
   *   simStatusRaw: string | number,
   *   signalStrength: number, // 0 to 5 bars
   *   signalIcon: number,
   *   networkType: string,    // e.g. '4G / LTE', '3G', 'No Service'
   *   connectionStatus: 'connected' | 'connecting' | 'disconnected',
   *   connectedDevices: number
   * }>}
   */
  async getStatus() {
    throw new Error('getStatus() must be implemented by adapter subclass');
  }

  /**
   * Fetch device hardware and firmware info
   * @returns {Promise<{
   *   deviceName: string,
   *   imei: string,
   *   imsi?: string,
   *   hardwareVersion: string,
   *   softwareVersion: string,
   *   macAddress?: string,
   *   wanIpAddress?: string,
   *   gatewayIp: string
   * }>}
   */
  async getDeviceInfo() {
    throw new Error('getDeviceInfo() must be implemented by adapter subclass');
  }

  /**
   * Fetch WiFi credentials and basic configuration
   * @returns {Promise<{
   *   ssid: string,
   *   wpaKey: string,
   *   securityMode: string,
   *   isHidden: boolean
   * }>}
   */
  async getWifiCredentials() {
    throw new Error('getWifiCredentials() must be implemented by adapter subclass');
  }

  /**
   * Utility to ping the gateway with a strict timeout
   * @param {number} timeoutMs
   * @returns {Promise<boolean>}
   */
  async ping(timeoutMs = 2000) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(`http://${this.gatewayIp}/`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(id);
      return res.status < 500;
    } catch {
      return false;
    }
  }
}
