import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import routerService from '../services/RouterService';

const RouterContext = createContext(null);

export function RouterProvider({ children }) {
  const [activeAdapter, setActiveAdapter] = useState(routerService.getAdapter());
  const [isDetecting, setIsDetecting] = useState(true);
  const [isMockMode, setIsMockMode] = useState(false);
  const [status, setStatus] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [wifiData, setWifiData] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [detectionMessage, setDetectionMessage] = useState('Detecting router gateway...');

  const pollingRef = useRef(null);

  // Fetch real-time status
  const refreshStatus = useCallback(async () => {
    try {
      const data = await routerService.getStatus();
      setStatus(data);
      setConnectionError(null);
      setLastUpdated(Date.now());
      return data;
    } catch (err) {
      setConnectionError(err.message || 'Unable to connect to router');
      return null;
    }
  }, []);

  // Fetch device hardware/firmware details
  const refreshDeviceInfo = useCallback(async () => {
    try {
      const info = await routerService.getDeviceInfo();
      setDeviceInfo(info);
      return info;
    } catch {
      return null;
    }
  }, []);

  // Fetch WiFi credentials
  const refreshWifiCredentials = useCallback(async () => {
    try {
      const creds = await routerService.getWifiCredentials();
      setWifiData(creds);
      return creds;
    } catch {
      return null;
    }
  }, []);

  // Auto-detect router on startup or manual refresh
  const runAutoDetect = useCallback(async (customIp = null) => {
    setIsDetecting(true);
    setDetectionMessage('Pinging gateways (192.168.8.1, 192.168.0.1, 192.168.1.1)...');
    try {
      const result = await routerService.detectRouter(customIp);
      setActiveAdapter(result.adapter);

      if (result.success) {
        setDetectionMessage(`Connected to ${result.brand} gateway at ${result.gateway}`);
        setConnectionError(null);
      } else {
        setDetectionMessage(
          'No physical MiFi detected on current Wi-Fi. (Toggle Demo Mode on the Dashboard to test with simulated live data)'
        );
      }

      // Initial query
      await Promise.allSettled([
        refreshStatus(),
        refreshDeviceInfo(),
        refreshWifiCredentials(),
      ]);
    } catch (err) {
      setConnectionError(err.message);
    } finally {
      setIsDetecting(false);
    }
  }, [refreshStatus, refreshDeviceInfo, refreshWifiCredentials]);

  // Toggle Mock Mode for offline / non-MiFi testing in Expo Go
  const toggleMockMode = useCallback(async (enable) => {
    const targetMode = enable !== undefined ? enable : !isMockMode;
    setIsMockMode(targetMode);
    const newAdapter = routerService.setMockMode(targetMode);
    setActiveAdapter(newAdapter);

    if (targetMode) {
      setConnectionError(null);
      setDetectionMessage('Demo Mode active (simulating Huawei HiLink)');
    } else {
      setDetectionMessage('Switching to live router gateway...');
    }

    // Refresh all data
    await Promise.allSettled([
      refreshStatus(),
      refreshDeviceInfo(),
      refreshWifiCredentials(),
    ]);
  }, [isMockMode, refreshStatus, refreshDeviceInfo, refreshWifiCredentials]);

  // Auto-detection on mount
  useEffect(() => {
    runAutoDetect();
  }, [runAutoDetect]);

  // 5-second polling loop for real-time live metrics
  useEffect(() => {
    if (isDetecting) return;

    // Run first refresh immediately
    refreshStatus();

    // Set 5-second interval
    pollingRef.current = setInterval(() => {
      refreshStatus();
    }, 5000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isDetecting, isMockMode, refreshStatus]);

  return (
    <RouterContext.Provider
      value={{
        activeAdapter,
        status,
        deviceInfo,
        wifiData,
        isDetecting,
        isMockMode,
        connectionError,
        lastUpdated,
        detectionMessage,
        refreshStatus,
        refreshDeviceInfo,
        refreshWifiCredentials,
        runAutoDetect,
        toggleMockMode,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}
