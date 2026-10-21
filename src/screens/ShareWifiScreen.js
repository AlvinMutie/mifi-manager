import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  Card,
  Text,
  Button,
  useTheme,
  IconButton,
  Snackbar,
  TextInput,
  Surface,
} from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from '../context/RouterContext';

export default function ShareWifiScreen() {
  const theme = useTheme();
  const { wifiData, refreshWifiCredentials } = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Allow manual fallback in case router admin password is required
  const [customSsid, setCustomSsid] = useState('');
  const [customPassword, setCustomPassword] = useState('');

  const ssid = customSsid || wifiData?.ssid || 'Huawei-MiFi';
  const password = customPassword || wifiData?.wpaKey || '12345678';
  const securityType = wifiData?.securityMode || 'WPA';

  // Standard Wi-Fi connection QR string format:
  // WIFI:T:WPA;S:<SSID>;P:<PASSWORD>;;
  const wifiQrString = `WIFI:T:${securityType.includes('WPA') ? 'WPA' : 'nopass'};S:${ssid};P:${password};;`;

  const copyToClipboard = async (text, label) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    setSnackbarMsg(`Copied ${label} to clipboard!`);
    setSnackbarVisible(true);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* QR Code Presentation Card */}
      <Card style={[styles.qrCard, { backgroundColor: theme.colors.surface }]} mode="elevated">
        <Card.Content style={styles.qrCardContent}>
          <Text variant="titleLarge" style={{ fontWeight: '800', textAlign: 'center', marginBottom: 4 }}>
            Scan to Join Wi-Fi
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginBottom: 20 }}
          >
            Point any phone camera to instantly connect to this MiFi hotspot
          </Text>

          {/* QR Code container with rounded white frame */}
          <Surface style={styles.qrContainer} elevation={4}>
            <QRCode
              value={wifiQrString}
              size={210}
              backgroundColor="#ffffff"
              color="#090d16"
              logoBackgroundColor="transparent"
            />
          </Surface>

          {/* Network SSID Badge */}
          <View style={[styles.ssidBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="wifi" size={20} color={theme.colors.primary} />
            <Text
              variant="titleMedium"
              style={{ fontWeight: '700', marginLeft: 8, color: theme.colors.onSurface }}
            >
              {ssid}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* WiFi Credentials & Copy Action Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
        <Card.Title
          title="Network Credentials"
          titleVariant="titleMedium"
          right={(props) => (
            <IconButton
              {...props}
              icon={isEditing ? 'check' : 'pencil-outline'}
              onPress={() => setIsEditing(!isEditing)}
            />
          )}
        />
        <Card.Content>
          {isEditing ? (
            <View style={{ marginBottom: 12 }}>
              <TextInput
                label="Network Name (SSID)"
                value={customSsid || ssid}
                onChangeText={setCustomSsid}
                mode="outlined"
                style={{ marginBottom: 10 }}
                dense
              />
              <TextInput
                label="Wi-Fi Password (WPA Key)"
                value={customPassword || password}
                onChangeText={setCustomPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                dense
              />
            </View>
          ) : (
            <>
              {/* SSID Row */}
              <View style={styles.credRow}>
                <View style={{ flex: 1 }}>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    NETWORK NAME (SSID)
                  </Text>
                  <Text variant="bodyLarge" style={{ fontWeight: '600' }}>
                    {ssid}
                  </Text>
                </View>
                <IconButton
                  icon="content-copy"
                  size={20}
                  iconColor={theme.colors.primary}
                  onPress={() => copyToClipboard(ssid, 'Network SSID')}
                />
              </View>

              {/* Password Row */}
              <View style={[styles.credRow, { marginTop: 12 }]}>
                <View style={{ flex: 1 }}>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    PASSWORD (WPA KEY)
                  </Text>
                  <Text variant="bodyLarge" style={{ fontWeight: '600', letterSpacing: showPassword ? 0 : 2 }}>
                    {showPassword ? password : '••••••••••••'}
                  </Text>
                </View>
                <IconButton
                  icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  iconColor={theme.colors.onSurfaceVariant}
                  onPress={() => setShowPassword(!showPassword)}
                />
                <IconButton
                  icon="content-copy"
                  size={20}
                  iconColor={theme.colors.primary}
                  onPress={() => copyToClipboard(password, 'Wi-Fi Password')}
                />
              </View>
            </>
          )}

          {/* Primary Action Button: Copy Password */}
          <Button
            mode="contained"
            icon="clipboard-text-outline"
            onPress={() => copyToClipboard(password, 'Wi-Fi Password')}
            style={styles.copyButton}
            contentStyle={{ height: 48 }}
          >
            Copy Password
          </Button>

          {/* Sync / Refresh Credentials */}
          <Button
            mode="text"
            icon="sync"
            onPress={() => refreshWifiCredentials()}
            style={{ marginTop: 8 }}
            textColor={theme.colors.primary}
          >
            Reload From Router
          </Button>
        </Card.Content>
      </Card>

      {/* Instructions Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
        <Card.Title title="How to Connect" titleVariant="titleMedium" />
        <Card.Content>
          <View style={styles.instructionStep}>
            <MaterialCommunityIcons name="camera" size={22} color={theme.colors.secondary} />
            <Text variant="bodySmall" style={styles.stepText}>
              1. Open the Camera app on an iPhone or Android phone.
            </Text>
          </View>
          <View style={styles.instructionStep}>
            <MaterialCommunityIcons name="qrcode-scan" size={22} color={theme.colors.secondary} />
            <Text variant="bodySmall" style={styles.stepText}>
              2. Align the viewfinder over the QR code above.
            </Text>
          </View>
          <View style={styles.instructionStep}>
            <MaterialCommunityIcons name="wifi-check" size={22} color={theme.colors.secondary} />
            <Text variant="bodySmall" style={styles.stepText}>
              3. Tap the prompt banner to instantly connect without entering passwords.
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
      >
        {snackbarMsg}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  qrCard: {
    borderRadius: 20,
    marginBottom: 16,
  },
  qrCardContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  qrContainer: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  ssidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
  },
  credRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButton: {
    marginTop: 18,
    borderRadius: 12,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepText: {
    flex: 1,
    marginLeft: 12,
    color: '#9ca3af',
  },
});
