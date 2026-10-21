import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from '../context/RouterContext';

const { width } = Dimensions.get('window');

export default function ShareWifiScreen() {
  const theme = useTheme();
  const { wifiData, refreshWifiCredentials } = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [customSsid, setCustomSsid] = useState('');
  const [customPassword, setCustomPassword] = useState('');

  const ssid = customSsid || wifiData?.ssid || 'Huawei-MiFi';
  const password = customPassword || wifiData?.wpaKey || '12345678';
  const securityType = wifiData?.securityMode || 'WPA2-PSK';

  // Standard Wi-Fi connection QR payload
  const wifiQrString = `WIFI:T:${securityType.includes('WPA') ? 'WPA' : 'nopass'};S:${ssid};P:${password};;`;

  const copyToClipboard = async (text, label) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    setToastMessage(`Copied ${label}`);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 2000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      {/* iOS Floating Capsule Toast */}
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
            NETWORK ACCESS
          </Text>
          <Text style={[styles.largeTitle, { color: theme.colors.onSurface }]}>Share Wi-Fi</Text>
        </View>

        {/* Hero Apple Wallet-Style "Wi-Fi Pass" Card */}
        <View style={[styles.wifiPassCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          {/* Card Top Banner */}
          <View style={styles.passHeader}>
            <View style={[styles.passBadgeCircle, { backgroundColor: 'rgba(0, 122, 255, 0.12)' }]}>
              <MaterialCommunityIcons name="wifi" size={20} color="#007AFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.passEyebrow}>DIGITAL ACCESS PASS</Text>
              <Text style={[styles.passSsidTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
                {ssid}
              </Text>
            </View>
          </View>

          {/* QR Code Container */}
          <View style={styles.qrFrameWrapper}>
            <View style={styles.qrInnerFrame}>
              <QRCode
                value={wifiQrString}
                size={Math.min(width - 120, 210)}
                backgroundColor="#FFFFFF"
                color="#000000"
              />
            </View>
          </View>

          <Text style={styles.qrHintText}>
            Point any mobile camera at this code to join automatically
          </Text>
        </View>

        {/* Primary Action Button: Copy Password */}
        <TouchableOpacity
          style={[styles.iosPrimaryActionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => copyToClipboard(password, 'Password')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="content-copy" size={18} color="#FFFFFF" />
          <Text style={styles.iosPrimaryActionText}>Copy Password</Text>
        </TouchableOpacity>

        {/* Section: Credentials */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>NETWORK CREDENTIALS</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.sectionEditAction, { color: theme.colors.primary }]}>
              {isEditing ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inset Grouped Table for Credentials */}
        <View style={[styles.iosGroupedCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          {isEditing ? (
            <View style={styles.editFormPadding}>
              <Text style={[styles.inputFieldLabel, { color: theme.colors.onSurfaceVariant }]}>NETWORK NAME (SSID)</Text>
              <TextInput
                style={[
                  styles.iosTextInput,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.onSurface,
                    borderColor: theme.colors.outline,
                  },
                ]}
                value={customSsid || ssid}
                onChangeText={setCustomSsid}
                placeholder="SSID"
                placeholderTextColor="#8E8E93"
              />
              <Text style={[styles.inputFieldLabel, { color: theme.colors.onSurfaceVariant, marginTop: 12 }]}>
                WI-FI PASSWORD
              </Text>
              <TextInput
                style={[
                  styles.iosTextInput,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.onSurface,
                    borderColor: theme.colors.outline,
                  },
                ]}
                value={customPassword || password}
                onChangeText={setCustomPassword}
                placeholder="Password"
                placeholderTextColor="#8E8E93"
              />
            </View>
          ) : (
            <>
              {/* Row 1: SSID */}
              <View style={styles.iosRow}>
                <View style={[styles.iosIconBadge, { backgroundColor: '#007AFF' }]}>
                  <MaterialCommunityIcons name="wifi" size={18} color="#FFFFFF" />
                </View>
                <Text style={[styles.iosRowLabel, { color: theme.colors.onSurface }]}>Network Name</Text>
                <View style={styles.iosRowRight}>
                  <Text style={[styles.iosRowValue, { color: theme.colors.onSurfaceVariant }]}>
                    {ssid}
                  </Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(ssid, 'Network Name')}
                    style={styles.copyIconWrapper}
                  >
                    <MaterialCommunityIcons name="content-copy" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.iosDivider, { backgroundColor: theme.colors.outline }]} />

              {/* Row 2: Password */}
              <View style={styles.iosRow}>
                <View style={[styles.iosIconBadge, { backgroundColor: '#34C759' }]}>
                  <MaterialCommunityIcons name="key-variant" size={18} color="#FFFFFF" />
                </View>
                <Text style={[styles.iosRowLabel, { color: theme.colors.onSurface }]}>Password</Text>
                <View style={styles.iosRowRight}>
                  <Text
                    style={[
                      styles.iosRowValue,
                      {
                        color: theme.colors.onSurfaceVariant,
                        letterSpacing: showPassword ? 0 : 2,
                      },
                    ]}
                  >
                    {showPassword ? password : '••••••••••••'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.copyIconWrapper}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={17}
                      color="#8E8E93"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(password, 'Password')}
                    style={styles.copyIconWrapper}
                  >
                    <MaterialCommunityIcons name="content-copy" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.iosDivider, { backgroundColor: theme.colors.outline }]} />

              {/* Row 3: Security */}
              <View style={styles.iosRow}>
                <View style={[styles.iosIconBadge, { backgroundColor: '#5856D6' }]}>
                  <MaterialCommunityIcons name="shield-check" size={18} color="#FFFFFF" />
                </View>
                <Text style={[styles.iosRowLabel, { color: theme.colors.onSurface }]}>Security</Text>
                <View style={styles.iosRowRight}>
                  <Text style={[styles.iosRowValue, { color: theme.colors.onSurfaceVariant }]}>
                    {securityType}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Section: How to Connect */}
        <Text style={styles.sectionHeader}>HOW GUESTS JOIN</Text>
        <View style={[styles.iosGroupedCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <View style={styles.instructionRow}>
            <View style={[styles.stepNumberBadge, { backgroundColor: 'rgba(0, 122, 255, 0.12)' }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={[styles.instructionText, { color: theme.colors.onSurface }]}>
              Open the native Camera app on iOS or Android.
            </Text>
          </View>
          <View style={[styles.iosDivider, { backgroundColor: theme.colors.outline }]} />
          <View style={styles.instructionRow}>
            <View style={[styles.stepNumberBadge, { backgroundColor: 'rgba(0, 122, 255, 0.12)' }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={[styles.instructionText, { color: theme.colors.onSurface }]}>
              Frame the QR code inside the viewfinder.
            </Text>
          </View>
          <View style={[styles.iosDivider, { backgroundColor: theme.colors.outline }]} />
          <View style={styles.instructionRow}>
            <View style={[styles.stepNumberBadge, { backgroundColor: 'rgba(52, 199, 89, 0.12)' }]}>
              <Text style={[styles.stepNumberText, { color: '#34C759' }]}>3</Text>
            </View>
            <Text style={[styles.instructionText, { color: theme.colors.onSurface }]}>
              Tap the banner to connect without typing passwords.
            </Text>
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
  wifiPassCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  passHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 18,
  },
  passBadgeCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#8E8E93',
  },
  passSsidTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 2,
  },
  qrFrameWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  qrInnerFrame: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  qrHintText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    maxWidth: '85%',
    lineHeight: 18,
  },
  iosPrimaryActionButton: {
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  iosPrimaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: 6,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  sectionEditAction: {
    fontSize: 14,
    fontWeight: '600',
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
  },
  iosRowValue: {
    fontSize: 15,
    fontWeight: '400',
  },
  copyIconWrapper: {
    marginLeft: 10,
    padding: 2,
  },
  iosDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 19,
  },
  editFormPadding: {
    padding: 16,
  },
  inputFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  iosTextInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: 1,
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
