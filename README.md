# MiFi Manager

MiFi Manager is a mobile application built on the React Native and Expo frameworks, designed to monitor, manage, and interact with portable Wi-Fi (MiFi) hotspot devices over local networks. The application implements an extensible Adapter Pattern architecture to communicate with router administrative APIs, starting with an implementation for Huawei HiLink devices.

---

## Table of Contents

- [Motivation and Background](#motivation-and-background)
- [Key Features](#key-features)
- [Architecture](#architecture)
  - [Adapter Pattern Design](#adapter-pattern-design)
  - [Router Auto-Detection](#router-auto-detection)
- [Huawei HiLink Protocol Implementation](#huawei-hilink-protocol-implementation)
  - [Authentication Flow](#authentication-flow)
  - [API Endpoints](#api-endpoints)
- [Screens and User Interface](#screens-and-user-interface)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running with Expo Go](#running-with-expo-go)
  - [Connecting to Physical Hardware](#connecting-to-physical-hardware)
  - [Building a Standalone Android APK](#building-a-standalone-android-apk)
- [Configuration and Troubleshooting](#configuration-and-troubleshooting)

---

## Motivation and Background

As the owner of a portable Huawei MiFi hotspot, I routinely needed a quick, reliable way to check how many client devices were connected to my personal network, verify battery health, and check cellular signal levels on the go.

The standard way to access this information involves opening a mobile browser, navigating to `192.168.8.1`, and navigating through an outdated, unresponsive desktop-oriented web administration interface.

Instead of creating another web dashboard, I engineered a dedicated mobile application that runs directly on mobile devices and queries the router over the local wireless link. MiFi Manager retrieves the necessary operational telemetry, including active connected clients, battery percentage, cellular network generation, hardware specifications, and Wi-Fi security keys, presented through a clean and responsive mobile interface.

---

## Key Features

- **Automated Gateway Discovery**: Probes common gateway subnets (`192.168.8.1`, `192.168.100.1`, `192.168.1.1`, `192.168.0.1`, `192.168.43.1`) upon launch to resolve and attach the matching adapter.
- **Continuous Telemetry Polling**: Automatically refreshes device metrics on a 5-second interval while maintaining lightweight background state.
- **Hardware Inventory**: Extracts device identifiers, serial numbers, firmware versions, and network addresses with one-touch clipboard copying.
- **Wi-Fi QR Sharing**: Reads the SSID and security key from router configuration endpoints and formats them into a standard QR code string for guest access.
- **Dual-Mode Operation**: Includes an integrated offline mock adapter (`MockAdapter`) that simulates telemetry fluctuations for interface validation without requiring physical hardware.
- **Custom Gateway Routing**: Supports manual IP overrides for devices configured on customized subnets.

---

## Architecture

### Adapter Pattern Design

The service layer is structured around an abstract base class, `RouterAdapter`, establishing a uniform contract across diverse router brands and communication protocols.

```
+-------------------------------------------------------------+
|                        RouterService                        |
|   (Auto-detection, Gateway Probing, Adapter Lifecycle)      |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                     RouterAdapter (Base)                    |
|  - authenticate()                                           |
|  - getStatus()                                              |
|  - getDeviceInfo()                                          |
|  - getWifiCredentials()                                     |
|  - ping()                                                   |
+-------------------------------------------------------------+
          |                                        |
          v                                        v
+-------------------+                    +-------------------+
|   HuaweiAdapter   |                    |    MockAdapter    |
| (HiLink XML APIs) |                    | (Demo Simulation) |
+-------------------+                    +-------------------+
```

- **`RouterAdapter`**: Defines abstract methods for authentication, telemetry, hardware identification, and credential retrieval.
- **`HuaweiAdapter`**: Concrete implementation parsing XML responses from Huawei HiLink endpoints and handling session verification tokens.
- **`MockAdapter`**: Concrete simulation adapter emitting dynamic state variations for testing.
- **`RouterService`**: Singleton coordinator managing gateway probing, adapter instantiation, and delegation.

### Router Auto-Detection

Upon startup, `RouterService.detectRouter()` sequentially checks gateway IPs with an `AbortController`-backed timeout. It queries identification endpoints (such as `/api/webserver/token`) to detect HiLink signatures and instantiates the matching adapter.

---

## Huawei HiLink Protocol Implementation

### Authentication Flow

1. **Session and Token Negotiation**:
   - Queries `/api/webserver/SesTokInfo` or `/api/webserver/token`.
   - Parses the `<TokInfo>` or `<token>` element from the XML payload using `fast-xml-parser`.
   - Extracts session cookies (`SessionID=...`) from HTTP response headers.
2. **Request Verification**:
   - Injects the extracted token into the `__RequestVerificationToken` header on all subsequent GET and POST API calls.
   - Attaches session cookies to maintain authorized state.

### API Endpoints

| Endpoint | HTTP Method | Data Extracted |
| :--- | :--- | :--- |
| `/api/webserver/token` | GET | Verification token, Session headers |
| `/api/webserver/SesTokInfo` | GET | Composite session cookie and token info |
| `/api/monitoring/status` | GET | `BatteryPercent`, `BatteryStatus`, `SimStatus`, `SignalIcon`, `CurrentNetworkType`, `CurrentWifiUser`, `ConnectionStatus` |
| `/api/device/information` | GET | `DeviceName`, `Imei`, `Imsi`, `HardwareVersion`, `SoftwareVersion`, `MacAddress1`, `WanIPAddress` |
| `/api/wlan/basic-settings` | GET | `WifiSsid`, `WifiHide` |
| `/api/wlan/security-settings` | GET | `WifiWpaPsk`, `WifiAuthmode`, `WifiKey` |

---

## Screens and User Interface

- **Dashboard Screen**: Displays a circular SVG battery ring gauge, real-time signal strength bars, SIM card readiness, connected Wi-Fi device counter, and a toggle for offline demonstration mode.
- **Device Details Screen**: Groups technical specifications into organized sections, covering hardware revisions, firmware versions, IMEI/IMSI numbers, MAC addresses, and a manual gateway input module.
- **Share Wi-Fi Screen**: Formats credentials into a standard Wi-Fi connection string (`WIFI:T:WPA;S:<SSID>;P:<KEY>;;`), displayed via a vector QR code with show/hide password toggling and quick clipboard actions.

---

## Project Structure

```
mifi/
├── App.js                         # Root component, tab navigation, theme providers
├── app.json                       # Expo configuration, permissions, package definitions
├── eas.json                       # Standalone Android APK build configurations
├── package.json                   # Project dependencies and script declarations
├── src/
│   ├── context/
│   │   └── RouterContext.js       # React context managing global state and 5s polling
│   ├── screens/
│   │   ├── DashboardScreen.js     # Telemetry dashboard with SVG battery ring gauge
│   │   ├── DeviceDetailsScreen.js # Hardware specs, identifiers, and gateway configuration
│   │   └── ShareWifiScreen.js     # Wi-Fi credentials and QR code sharing
│   ├── services/
│   │   ├── RouterAdapter.js       # Base abstract adapter definition
│   │   ├── HuaweiAdapter.js       # Huawei HiLink XML implementation
│   │   ├── MockAdapter.js         # Offline simulated adapter
│   │   └── RouterService.js       # Gateway detector and service singleton
│   └── theme/
│       └── theme.js               # Clean dark and light theme token definitions
└── README.md                      # Technical documentation
```

---

## Tech Stack

- **Runtime and Tooling**: React Native, Expo SDK
- **Navigation**: React Navigation (Bottom Tabs Navigator)
- **Component Library**: React Native Paper (Material Design 3)
- **Vector Icons**: Expo Vector Icons (Material Community Icons)
- **QR Code Rendering**: `react-native-qrcode-svg`, `react-native-svg`
- **Data Serialization**: `fast-xml-parser`
- **System Utilities**: `expo-clipboard`, `react-native-safe-area-context`

---

## Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm or yarn
- An Android or iOS mobile device with the **Expo Go** application installed

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AlvinMutie/mifi-manager.git
   cd mifi-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify environment compatibility:
   ```bash
   npx expo-doctor
   ```

### Running with Expo Go

1. Launch the Expo Metro bundler:
   ```bash
   npx expo start -c
   ```

2. Open the application:
   - **Android**: Launch the **Expo Go** app and select **Scan QR Code** to scan the terminal output.
   - **iOS**: Open the native **Camera** app, scan the terminal QR code, and tap the prompt to open in Expo Go.

### Connecting to Physical Hardware

To interact with a physical portable MiFi:

1. Ensure the MiFi device is powered on and broadcasting its wireless network.
2. Connect both your mobile testing phone and your development workstation to the MiFi Wi-Fi network.
3. In the application:
   - Disable the **Demo Mode** switch on the Dashboard.
   - Tap **Re-Scan Local Gateways** to initiate auto-detection.
4. If your router uses a non-standard subnet (such as `192.168.100.1` or `192.168.1.1`), navigate to the **Device Details** screen, input the IP under **Custom Gateway Configuration**, and select **Connect**.

### Building a Standalone Android APK

To generate a standalone `.apk` for direct installation on Android devices:

```bash
# 1. Generate the native Android folder
npx expo prebuild --platform android

# 2. Compile release APK
cd android && ./gradlew assembleRelease
```

The resulting file will be available at `android/app/build/outputs/apk/release/app-release.apk`.

---

## Configuration and Troubleshooting

- **Incompatible SDK Version**: Ensure the Expo SDK specified in `package.json` aligns with the version supported by your installed Expo Go client on mobile. Run `npx expo install --fix` if dependency alignment is required.
- **Connection Timeouts**: React Native aborts fetch requests when a destination IP is unreachable on the active wireless interface. Verify that the mobile device has not reverted to cellular data and remains connected to the router local subnet.
- **Cleartext HTTP Traffic**: HiLink administrative interfaces operate over standard HTTP (`http://192.168.8.1`). Standalone release builds have `usesCleartextTraffic: true` configured in `app.json` to allow local HTTP requests.
