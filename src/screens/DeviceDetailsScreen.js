import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from '../context/RouterContext';

export default function DeviceDetailsScreen() {
  const theme = useTheme();
  const {
    activeAdapter,
    deviceInfo,
    refreshDeviceInfo,
    runAutoDetect,
    isDetecting,
  } = useRouter();

  const [customIp, setCustomIp] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const copyToClipboard = async (text, label) => {
    if (!text || text === 'N/A') return;
    await Clipboard.setStringAsync(text);
    setToastMessage(`Copied ${label}`);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 2000);
  };

  const handleCustomConnect = () => {
    if (customIp.trim()) {
      runAutoDetect(customIp.trim());
    }
  };

  const renderIosRow = (icon, iconBg, label, value, canCopy = false) => {
    return (
      <View style={styles.iosRow}>
        <View style={[styles.iosIconBadge, { backgroundColor: iconBg }]}>
          <MaterialCommunityIcons name={icon} size={18} color="#FFFFFF" />
        </View>
        <Text style={[styles.iosRowLabel, { color: theme.colors.onSurface }]}>{label}</Text>
        <View style={styles.iosRowRight}>
          <Text
            style={[styles.iosRowValue, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={1}
          >
            {value || 'N/A'}
          </Text>
          {canCopy && value && value !== 'N/A' && (
            <TouchableOpacity
              onPress={() => copyToClipboard(value, label)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.copyIconWrapper}
            >
              <MaterialCommunityIcons name="content-copy" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      {/* iOS Floating Capsule Toast (Dynamic Island style) */}
      {toastVisible && (
        <View style={[styles.iosFloatingToast, { backgroundColor: theme.colors.surfaceVariant }]}>
          <MaterialCommunityIcons name="check-circle" size={16} color="#34C759" />
          <Text style={[styles.iosToastText, { color: theme.colors.onSurface }]}>
            {toastMessage}
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* iOS Large Title Header */}
        <View style={styles.headerContainer}>
          <Text variant="labelSmall" style={styles.eyebrow}>
            SYSTEM SPECIFICATIONS
          </Text>
          <Text style={[styles.largeTitle, { color: theme.colors.onSurface }]}>Device Info</Text>
        </View>

        {/* Hero Hardware Profile Card */}
        <View style={[styles.heroProfileCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <View style={[styles.deviceIconCircle, { backgroundColor: 'rgba(0, 122, 255, 0.12)' }]}>
            <MaterialCommunityIcons name="router-wireless-settings" size={32} color="#007AFF" />
          </View>
          <Text style={[styles.deviceModelName, { color: theme.colors.onSurface }]}>
            {deviceInfo?.deviceName || deviceInfo?.model || 'Huawei Mobile WiFi'}
          </Text>
          <Text style={styles.deviceProtocol}>
            Protocol: {activeAdapter?.name || 'Huawei HiLink'} • Active Gateway
          </Text>

          <TouchableOpacity
            style={[styles.iosSecondaryButton, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => refreshDeviceInfo()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="refresh" size={16} color={theme.colors.primary} />
            <Text style={[styles.iosSecondaryButtonText, { color: theme.colors.primary }]}>
              Refresh Hardware Telemetry
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 1: Hardware Specifications */}
        <Text style={styles.sectionHeader}>HARDWARE & SOFTWARE</Text>
        <View style={[styles.iosGroupedCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          {renderIosRow('router-wireless', '#007AFF', 'Device Model', deviceInfo?.deviceName || 'Huawei MiFi')}
          <View style={[styles.iosDivider, { backgroundColor: theme.colors.outline }]} />
          {renderIosRow('cellphone-arrow-down', '#34C759', 'Firmware', deviceInfo?.softwareVersion || 'N/A')}
          <View style={[styles.iosDivider, { backgroundColor: theme.colors.outline }]} />
          {renderIosRow('chip', '#5856D6', 'Hardware Revision', deviceInfo?.hardwareVersion || 'N/A')}
          <View style={[styles.iosDivider, { backgroundColor: theme.colors.outline }]} />
          {renderIosRow('application-brackets', '#FF9500', 'Web UI Build', deviceInfo?.webUiVersion || 'N/A')}
        </View>

        {/* Section 2: Cellular Identifiers */}
        <Text style={styles.sectionHeader}>CELLULAR IDENTIFIERS</Text>
        <View style={[styles.iosGroupedCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          {renderIosRow('barcode-scan', '#AF52DE', 'IMEI', deviceInfo?.imei || 'N/A', true)}
          <View style={[styles.iosDivider, { backgroundColor: theme.colors.outline }]} />
          {renderIosRow('sim', '#FF2D55', 'IMSI', deviceInfo?.imsi || 'N/A', true)}
        </View>

        {/* Section 3: Network Configuration */}
        <Text style={styles.sectionHeader}>NETWORK ADDRESSES</Text>
        <View style={[styles.iosGroupedCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          {renderIosRow('ip-network', '#007AFF', 'Gateway IP', deviceInfo?.gatewayIp || activeAdapter?.gatewayIp || '192.168.8.1', true)}
          <View style={[styles.iosDivider, { backgroundColor: theme.colors.outline }]} />
          {renderIosRow('ethernet', '#5AC8FA', 'MAC Address', deviceInfo?.macAddress || 'N/A', true)}
          <View style={[styles.iosDivider, { backgroundColor: theme.colors.outline }]} />
          {renderIosRow('earth', '#34C759', 'Cellular WAN IP', deviceInfo?.wanIpAddress || 'N/A')}
        </View>

        {/* Section 4: Custom Gateway IP Input */}
        <Text style={styles.sectionHeader}>CUSTOM GATEWAY SUBNET</Text>
        <View style={[styles.iosGroupedCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <View style={styles.customIpContainer}>
            <Text style={[styles.customIpExplanation, { color: theme.colors.onSurfaceVariant }]}>
              If your pocket MiFi router is configured on a non-standard subnet (e.g. 192.168.100.1 or 192.168.43.1):
            </Text>
            <View style={styles.inputActionRow}>
              <TextInput
                style={[
                  styles.iosTextInput,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.onSurface,
                    borderColor: theme.colors.outline,
                  },
                ]}
                placeholder="192.168.8.1"
                placeholderTextColor="#8E8E93"
                value={customIp}
                onChangeText={setCustomIp}
                keyboardType="numeric"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[
                  styles.iosPrimaryButton,
                  {
                    backgroundColor: customIp.trim() ? theme.colors.primary : theme.colors.surfaceVariant,
                    opacity: customIp.trim() ? 1 : 0.6,
                  },
                ]}
                onPress={handleCustomConnect}
                disabled={!customIp.trim() || isDetecting}
                activeOpacity={0.8}
              >
                {isDetecting ? (
                  <ActivityIndicator size={16} color="#FFFFFF" />
                ) : (
                  <Text style={styles.iosPrimaryButtonText}>Connect</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#8E8E93',
    marginBottom: 4,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.35,
  },
  heroProfileCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  deviceIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  deviceModelName: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  deviceProtocol: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
  },
  iosSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  iosSecondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 6,
  },
  iosGroupedCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  iosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  iosIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iosRowLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  iosRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '50%',
  },
  iosRowValue: {
    fontSize: 15,
    fontWeight: '400',
  },
  copyIconWrapper: {
    marginLeft: 8,
    padding: 2,
  },
  iosDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60,
  },
  customIpContainer: {
    padding: 16,
  },
  customIpExplanation: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  inputActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iosTextInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: 1,
    marginRight: 10,
  },
  iosPrimaryButton: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iosPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  iosFloatingToast: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  iosToastText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
});
