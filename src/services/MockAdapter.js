import { RouterAdapter } from './RouterAdapter';

/**
 * MockAdapter for local testing and demonstration.
 * Provides realistic fluctuating metrics (battery, signal, wifi devices)
 * so that users testing in Expo Go without physical hardware can see all screens,
 * QR code sharing, device info, and 5s polling in action.
 */
export class MockAdapter extends RouterAdapter {
  constructor(gatewayIp = '192.168.8.1 (Simulated)') {
    super(gatewayIp);
    this.name = 'Huawei HiLink (Demo Mode)';
    this.battery = 88;
    this.signal = 4;
    this.devices = 3;
    this.charging = false;
  }

  async authenticate() {
    this.token = 'demo-hilink-token-9f8a7b6c5d4e';
    return true;
  }

  async getStatus() {
    // Subtle simulation of live metrics over time
    if (!this.charging && Math.random() > 0.7 && this.battery > 10) {
      this.battery -= 1;
    } else if (this.charging && Math.random() > 0.6 && this.battery < 100) {
      this.battery += 1;
    }

    if (Math.random() > 0.75) {
      this.signal = Math.max(1, Math.min(5, this.signal + (Math.random() > 0.5 ? 1 : -1)));
    }

    return {
      batteryPercent: this.battery,
      isCharging: this.charging,
      simStatus: 'ready',
      simStatusRaw: 1,
      signalStrength: this.signal,
      signalIcon: this.signal,
      networkType: 'LTE / 4G',
      connectionStatus: 'connected',
      connectedDevices: this.devices,
      gatewayIp: this.gatewayIp,
      timestamp: Date.now(),
    };
  }

  async getDeviceInfo() {
    return {
      deviceName: 'Huawei E5577s-321',
      model: 'E5577 Mobile WiFi',
      imei: '864920038291048',
      imsi: '460012345678901',
      hardwareVersion: 'CL1E5577SM',
      softwareVersion: '21.328.01.00.00',
      webUiVersion: '17.100.18.03.00',
      macAddress: 'AC:7F:3E:9B:21:5C',
      wanIpAddress: '100.78.210.45',
      gatewayIp: '192.168.8.1',
    };
  }

  async getWifiCredentials() {
    return {
      ssid: 'Huawei-MiFi-5G_Turbo',
      wpaKey: 'FastWiFiPass2026',
      securityMode: 'WPA2-PSK',
      isHidden: false,
    };
  }
}
