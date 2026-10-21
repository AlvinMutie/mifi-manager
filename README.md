# MiFi Manager

MiFi Manager is a React Native mobile application built on the Expo framework, engineered to monitor, manage, and interact with portable Wi-Fi (MiFi) hotspot devices over local networks. The application implements an extensible Adapter Pattern architecture to interface with router administrative APIs, beginning with a complete implementation for Huawei HiLink devices.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
  - [Adapter Pattern Design](#adapter-pattern-design)
  - [Router Auto-Detection](#router-auto-detection)
- [Huawei HiLink Implementation](#huawei-hilink-implementation)
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
- [Configuration and Troubleshooting](#configuration-and-troubleshooting)

---

## Overview

Portable cellular Wi-Fi devices (MiFis) expose internal HTTP/XML APIs on their default gateway subnets. MiFi Manager detects these devices on the local wireless network, authenticates sessions via verification tokens, continuously polls device health indicators (battery percentage, SIM status, cellular signal strength, network technology), and facilitates seamless network sharing via generated QR codes.

---

## Key Features

- **Automated Gateway Discovery**: Probes common gateway subnets (`192.168.8.1`, `192.168.100.1`, `192.168.1.1`, `192.168.0.1`, `192.168.43.1`) upon application launch to dynamically resolve and attach the correct brand adapter.
- **Real-Time Health Monitoring**: Polls router telemetry at 5-second intervals to display battery percentage, charging states, SIM validation states, network generation (`LTE / 4G`, `5G`, `3G`), signal strength bars, and active connected client counts.
- **Hardware Inventory**: Extracts device serial details, IMEI, IMSI, firmware/software versions, hardware revisions, and WAN addresses with one-touch clipboard actions.
- **Wi-Fi QR Sharing**: Reads SSID and WPA encryption keys from router configuration endpoints and encodes them into standard Wi-Fi connection strings (`WIFI:T:WPA;S:<SSID>;P:<KEY>;;`) rendered via scalable vector graphics.
- **Dual-Mode Operation**: Includes an integrated offline mock adapter (`MockAdapter`) that simulates active telemetry fluctuations, allowing UI and functional testing in Expo Go without physical router hardware.
- **Custom Gateway Routing**: Provides manual IP overrides for customized network subnets.

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
- **`RouterService`**: Singleton manager managing gateway probing, adapter instantiation, and delegation.

### Router Auto-Detection

Upon startup, `RouterService.detectRouter()` sequentially checks gateway IPs with an `AbortController`-backed timeout. It queries identification endpoints (such as `/api/webserver/token`) to detect HiLink signatures and instantiates the matching adapter.

---

## Huawei HiLink Implementation

### Authentication Flow

1. **Session & Token Negotiation**:
   - Queries `/api/webserver/SesTokInfo` or `/api/webserver/token`.
   - Parses the `<TokInfo>` or `<token>` element from the XML payload.
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

- **Dashboard Screen**: Displays real-time device health cards, battery progress indicators, signal bar graphs, SIM condition badges, live polling status indicators, and the Demo Mode toggle.
- **Device Details Screen**: Lists technical hardware specifications, firmware versions, MAC addresses, and network identifiers, accompanied by an input module for manual gateway overrides.
- **Share Wi-Fi Screen**: Renders the SVG QR code formatted for native mobile camera scanners, displays SSID and masked security keys, and provides a plaintext password copy utility.

---

## Project Structure

```
mifi/
├── App.js                         # Root component, navigation setup, theme providers
├── app.json                       # Expo configuration and project manifest
├── package.json                   # Project dependencies and script declarations
├── src/
│   ├── context/
│   │   └── RouterContext.js       # React context managing global state and polling
│   ├── screens/
│   │   ├── DashboardScreen.js     # Telemetry and status dashboard
│   │   ├── DeviceDetailsScreen.js # Hardware info and gateway configuration
│   │   └── ShareWifiScreen.js     # Wi-Fi credentials and QR code sharing
│   ├── services/
│   │   ├── RouterAdapter.js       # Base abstract adapter definition
│   │   ├── HuaweiAdapter.js       # Huawei HiLink XML implementation
│   │   ├── MockAdapter.js         # Offline simulated adapter
│   │   └── RouterService.js       # Gateway detector and service singleton
│   └── theme/
│       └── theme.js               # Material Design 3 theme definitions
└── README.md                      # Technical documentation
```

---

## Tech Stack

- **Runtime & Tooling**: React Native, Expo SDK
- **Navigation**: React Navigation (Bottom Tabs Navigator)
- **Component Library**: React Native Paper (Material Design 3)
- **Vector Icons**: Expo Vector Icons (Material Community Icons)
- **QR Code Rendering**: `react-native-qrcode-svg`, `react-native-svg`
- **Data Serialization**: `fast-xml-parser`
- **System Utilities**: `expo-clipboard`

---

## Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm or yarn
- A physical Android or iOS mobile device with the **Expo Go** application installed

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
   npx expo start
   ```

2. Open the application:
   - **Android**: Launch the **Expo Go** app and select **Scan QR Code** to scan the terminal output.
   - **iOS**: Open the native **Camera** app, scan the terminal QR code, and tap the prompt to open in Expo Go.

### Connecting to Physical Hardware

To interact with a physical portable MiFi:

1. Ensure the MiFi device is powered on and broadcasting its wireless network.
2. Connect both your mobile testing phone and your development workstation to the MiFi's Wi-Fi network.
3. In the application:
   - Disable the **Simulate Live Data (Demo)** switch on the Dashboard.
   - Tap **Re-Scan Local Gateways** to initiate auto-detection.
4. If your router uses a non-standard subnet (such as `192.168.100.1` or `192.168.1.1`), navigate to the **Device Details** screen, input the IP under **Custom Gateway Configuration**, and select **Connect**.

---

## Configuration and Troubleshooting

- **Incompatible SDK Version**: Ensure the Expo SDK specified in `package.json` aligns with the version supported by your installed Expo Go client on mobile. Run `npx expo install --fix` if dependency alignment is required.
- **Connection Timeouts**: React Native aborts fetch requests when a destination IP is unreachable on the active wireless interface. Verify that the mobile device has not reverted to cellular data and remains connected to the router's local subnet.
- **Cleartext Traffic**: HiLink administrative interfaces operate over standard HTTP (`http://192.168.8.1`). Expo Go permits local network cleartext traffic by default.
