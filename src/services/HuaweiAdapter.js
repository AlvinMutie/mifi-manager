import { XMLParser } from 'fast-xml-parser';
import { RouterAdapter } from './RouterAdapter';

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: true,
  trimValues: true,
});

/**
 * Mapping of Huawei HiLink CurrentNetworkType codes to human-readable technology
 */
const NETWORK_TYPES = {
  0: 'No Service',
  1: 'GSM',
  2: 'GPRS',
  3: 'EDGE',
  4: 'WCDMA',
  5: 'HSDPA',
  6: 'HSUPA',
  7: 'HSPA',
  8: 'HSPA+',
  9: 'DC-HSPA+',
  19: 'LTE / 4G',
  21: 'LTE-A (4G+)',
  101: '5G (NSA)',
  102: '5G (SA)',
};

export class HuaweiAdapter extends RouterAdapter {
  constructor(gatewayIp = '192.168.8.1') {
    super(gatewayIp);
    this.name = 'Huawei HiLink';
    this.token = null;
    this.sessionId = null;
  }

  /**
   * Helper to perform authenticated GET/POST requests against the Huawei HiLink API
   */
  async request(endpoint, options = {}) {
    const url = `http://${this.gatewayIp}${endpoint}`;
    const headers = {
      Accept: '*/*',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      ...options.headers,
    };

    if (this.token) {
      headers['__RequestVerificationToken'] = this.token;
    }
    if (this.sessionId) {
      headers['Cookie'] = this.sessionId;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 4000);

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body,
        signal: controller.signal,
      });

      // Capture session tokens from response headers if present
      const tokenHeader =
        response.headers.get('__requestverificationtoken') ||
        response.headers.get('__RequestVerificationToken') ||
        response.headers.get('__RequestVerificationTokenone');
      if (tokenHeader) {
        this.token = tokenHeader;
      }

      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        const sessionMatch = setCookie.match(/SessionID=([^;]+)/i);
        if (sessionMatch) {
          this.sessionId = `SessionID=${sessionMatch[1]}`;
        }
      }

      const text = await response.text();
      clearTimeout(timeout);

      if (!text || !text.trim().startsWith('<')) {
        throw new Error(`Unexpected non-XML response from ${endpoint}: ${text.slice(0, 100)}`);
      }

      const parsed = parser.parse(text);
      if (parsed.error) {
        const errCode = parsed.error.code || 'UNKNOWN';
        const errMessage = parsed.error.message || `HiLink API Error (${errCode})`;
        const err = new Error(errMessage);
        err.code = errCode;
        throw err;
      }

      return parsed.response || parsed;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  /**
   * Huawei Authentication & Token acquisition:
   * HiLink exposes /api/webserver/token or /api/webserver/SesTokInfo
   */
  async authenticate() {
    try {
      // First attempt: /api/webserver/SesTokInfo (provides both Session and Token)
      try {
        const sesTokData = await this.request('/api/webserver/SesTokInfo', { timeoutMs: 2500 });
        if (sesTokData?.TokInfo) {
          this.token = String(sesTokData.TokInfo);
          if (sesTokData.SesInfo) {
            this.sessionId = `SessionID=${sesTokData.SesInfo}`;
          }
          return true;
        }
      } catch {
        // Fall back to /api/webserver/token
      }

      const data = await this.request('/api/webserver/token', { timeoutMs: 2500 });
      if (data?.token) {
        this.token = String(data.token);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Huawei authentication error:', err.message);
      return false;
    }
  }

  /**
   * Fetch current real-time monitoring status
   * Endpoint: /api/monitoring/status
   */
  async getStatus() {
    // Ensure we have a valid token if not already acquired
    if (!this.token) {
      await this.authenticate();
    }

    const data = await this.request('/api/monitoring/status');

    // Parse Battery percentage
    const batteryPercent = Number(data.BatteryPercent ?? data.batterypercent ?? 0);
    const isCharging = Number(data.BatteryStatus ?? data.batterystatus ?? 0) === 1;

    // Parse SIM status
    // 1: Normal, 0: No SIM, 2: PIN lock, 3: PUK lock, 255: Error/Unknown
    const rawSim = Number(data.SimStatus ?? data.simstatus ?? 1);
    let simStatus = 'ready';
    if (rawSim === 0) simStatus = 'missing';
    else if (rawSim === 2) simStatus = 'pin_required';
    else if (rawSim === 3) simStatus = 'puk_required';
    else if (rawSim !== 1) simStatus = 'error';

    // Parse Signal Icon & Strength (0 to 5 bars)
    const rawSignal = Number(data.SignalIcon ?? data.signalicon ?? 0);
    const signalStrength = Math.min(Math.max(rawSignal, 0), 5);

    // Network type
    const rawNetType = Number(data.CurrentNetworkType ?? data.currentnetworktype ?? 0);
    const networkType = NETWORK_TYPES[rawNetType] || (rawNetType > 0 ? `Cellular (${rawNetType})` : 'No Service');

    // Connection status (901: Connected, 900: Connecting, 902: Disconnected)
    const rawConn = Number(data.ConnectionStatus ?? data.connectionstatus ?? 901);
    let connectionStatus = 'connected';
    if (rawConn === 900) connectionStatus = 'connecting';
    else if (rawConn === 902 || rawConn === 903) connectionStatus = 'disconnected';

    // Connected devices count
    const connectedDevices = Number(data.CurrentWifiUser ?? data.currentwifiuser ?? 1);

    return {
      batteryPercent,
      isCharging,
      simStatus,
      simStatusRaw: rawSim,
      signalStrength,
      signalIcon: rawSignal,
      networkType,
      connectionStatus,
      connectedDevices,
      gatewayIp: this.gatewayIp,
      timestamp: Date.now(),
    };
  }

  /**
   * Fetch hardware, software, and device information
   * Endpoint: /api/device/information
   */
  async getDeviceInfo() {
    if (!this.token) {
      await this.authenticate();
    }

    const data = await this.request('/api/device/information');

    return {
      deviceName: String(data.DeviceName || data.devicename || 'Huawei Mobile WiFi'),
      model: String(data.ProductFamily || data.productfamily || data.DeviceName || 'Huawei MiFi'),
      imei: String(data.Imei || data.imei || 'N/A'),
      imsi: String(data.Imsi || data.imsi || 'N/A'),
      hardwareVersion: String(data.HardwareVersion || data.hardwareversion || 'N/A'),
      softwareVersion: String(data.SoftwareVersion || data.softwareversion || 'N/A'),
      webUiVersion: String(data.WebUIVersion || data.webuiversion || 'N/A'),
      macAddress: String(data.MacAddress1 || data.macaddress1 || 'N/A'),
      wanIpAddress: String(data.WanIPAddress || data.wanipaddress || 'N/A'),
      gatewayIp: this.gatewayIp,
    };
  }

  /**
   * Fetch WiFi credentials from basic-settings and security-settings
   */
  async getWifiCredentials() {
    if (!this.token) {
      await this.authenticate();
    }

    let ssid = 'Huawei-MiFi';
    let isHidden = false;
    let wpaKey = '';
    let securityMode = 'WPA2-PSK';

    // Try fetching basic settings for SSID
    try {
      const basic = await this.request('/api/wlan/basic-settings');
      if (basic?.WifiSsid || basic?.wifissid) {
        ssid = String(basic.WifiSsid || basic.wifissid);
      }
      if (basic?.WifiHide !== undefined) {
        isHidden = Number(basic.WifiHide) === 1;
      }
    } catch (e) {
      console.warn('Could not read /api/wlan/basic-settings:', e.message);
    }

    // Try fetching security settings for WPA Key / Password
    try {
      const security = await this.request('/api/wlan/security-settings');
      if (security?.WifiWpaPsk || security?.wifiwpapsk) {
        wpaKey = String(security.WifiWpaPsk || security.wifiwpapsk);
      } else if (security?.WifiKey || security?.wifikey) {
        wpaKey = String(security.WifiKey || security.wifikey);
      }

      if (security?.WifiAuthmode || security?.wifiauthmode) {
        securityMode = String(security.WifiAuthmode || security.wifiauthmode);
      }
    } catch (e) {
      console.warn('Could not read /api/wlan/security-settings:', e.message);
    }

    // Fallback: If password couldn't be fetched without admin auth, default to placeholder
    if (!wpaKey) {
      wpaKey = '12345678';
    }

    return {
      ssid,
      wpaKey,
      securityMode,
      isHidden,
    };
  }
}
