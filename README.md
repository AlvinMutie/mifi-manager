# 📶 MiFi Manager (React Native & Expo)

A mobile application designed to manage, monitor, and interact with portable WiFi devices (MiFi) over a local network. Built with **React Native**, **Expo**, **React Navigation**, **React Native Paper**, and the **Adapter Pattern** for extensible multi-brand router support.

---

## 🚀 Getting Started with Expo Go (Beginner's Guide)

If you have never used Expo Go before, follow these simple steps to preview and test the app on your phone:

### 1. Install Expo Go on Your Phone
- **Android**: Install [Expo Go from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS**: Install [Expo Go from the App Store](https://apps.apple.com/app/expo-go/id982107772)

### 2. Start the Development Server
In your terminal, navigate to the project directory and run:

```bash
npx expo start
```

### 3. Connect Your Phone
- Make sure your computer and your phone are connected to the same Wi-Fi network (or connect your computer and phone to your portable MiFi hotspot!).
- **Android**: Open the **Expo Go** app and tap **"Scan QR code"**, then scan the QR code displayed in your computer terminal.
- **iOS**: Open the native **Camera** app, point it at the QR code in your terminal, and tap the **"Open in Expo Go"** banner.

> **💡 Quick Tip - Testing without a physical router:**  
> If you are not connected to a physical Huawei MiFi hotspot right now, turn on the **"Simulate Live Data (Demo)"** switch at the top of the **Dashboard** screen. This activates realistic fluctuating battery, 4G cellular signal, and connected device simulation so you can explore all screens, the QR code generator, and 5-second polling immediately.

---

## 🏗️ Architecture & Features

### 1. Adapter Pattern (`src/services/`)
- [RouterAdapter.js](file:///home/blueberyy/Documents/mifi/src/services/RouterAdapter.js): Base abstract class enforcing the router contract (`authenticate()`, `getStatus()`, `getDeviceInfo()`, `getWifiCredentials()`, `ping()`).
- [HuaweiAdapter.js](file:///home/blueberyy/Documents/mifi/src/services/HuaweiAdapter.js): HiLink XML implementation for Huawei MiFi routers (e.g., E5577, E5573, E5785, etc.):
  - **Authentication**: Requests tokens via `/api/webserver/token` or `/api/webserver/SesTokInfo` and injects them into the `__RequestVerificationToken` header and session cookies.
  - **Monitoring Status**: Polls `/api/monitoring/status` and translates raw XML into battery level, charging state, SIM status (`ready`, `missing`, `pin_required`), signal strength (0-5 bars), and active Wi-Fi clients.
  - **Device Information**: Reads `/api/device/information` for IMEI, IMSI, hardware, software, and web UI versions.
  - **Wi-Fi Credentials**: Extracts SSID from `/api/wlan/basic-settings` and WPA key from `/api/wlan/security-settings`.
- [MockAdapter.js](file:///home/blueberyy/Documents/mifi/src/services/MockAdapter.js): Offline mock simulator with live metrics changes for development in Expo Go without physical hardware.
- [RouterService.js](file:///home/blueberyy/Documents/mifi/src/services/RouterService.js): Singleton manager that auto-detects reachable router gateways (`192.168.8.1`, `192.168.0.1`, `192.168.1.1`) and dynamically instantiates the appropriate adapter.

### 2. UI Screens (`src/screens/`)
- **Dashboard Screen**:
  - Real-time battery indicator with visual progress bar and charging status.
  - Cellular signal card with 5-bar visual graph, network type (`LTE / 4G`), and SIM card badge.
  - Connected Wi-Fi client count.
  - 5-second polling loop managed via React hooks.
  - Gateway status badge and Demo Mode toggle.
- **Device Details Screen**:
  - Displays hardware info: Device Name, IMEI, IMSI, Software/Firmware version, Hardware version, MAC address, and WAN IP.
  - One-tap clipboard copy buttons for IMEI, MAC address, and Gateway IP.
  - Custom Gateway input to connect to routers on custom subnets (e.g. `192.168.100.1`).
- **Share Wi-Fi Screen**:
  - Generates a standard Wi-Fi QR code (`WIFI:T:WPA;S:<SSID>;P:<PASSWORD>;;`) using `react-native-qrcode-svg`.
  - Displays the SSID and masked WPA key with visibility toggle.
  - **Copy Password** button powered by `expo-clipboard`.
  - Guide on how friends can scan and join directly from camera apps.

---

## 🛠️ Tech Stack
- **Framework**: [Expo SDK 58](https://expo.dev) / React Native 0.88
- **Navigation**: [React Navigation 7](https://reactnavigation.org) (Bottom Tabs)
- **UI & Theming**: [React Native Paper 5](https://callstack.github.io/react-native-paper/) (Material Design 3 dark/light palettes)
- **QR Code**: [react-native-qrcode-svg](https://github.com/awesomejerry/react-native-qrcode-svg) + [react-native-svg](https://github.com/software-mansion/react-native-svg)
- **XML Parsing**: [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)
- **Clipboard**: [expo-clipboard](https://docs.expo.dev/versions/latest/sdk/clipboard/)
# mifi-manager
