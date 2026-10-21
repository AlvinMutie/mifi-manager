import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';
import { useRouter } from '../context/RouterContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const theme = useTheme();
  const {
    activeAdapter,
    status,
    isDetecting,
    isMockMode,
    connectionError,
    lastUpdated,
    refreshStatus,
    runAutoDetect,
    toggleMockMode,
  } = useRouter();

  const [refreshing, setRefreshing] = useState(false);

  const onManualRefresh = async () => {
    setRefreshing(true);
    await refreshStatus();
    setRefreshing(false);
  };

  // Battery metrics & colors (iOS system colors)
  const batteryPercent = status?.batteryPercent ?? 0;
  const isCharging = status?.isCharging ?? false;

  const getBatteryColor = (percent) => {
    if (percent > 40) return '#34C759'; // iOS Green
    if (percent > 20) return '#FF9500'; // iOS Orange
    return '#FF3B30'; // iOS Red
  };

  const batteryColor = getBatteryColor(batteryPercent);

  // SVG Circular Battery Ring calculations
  const ringSize = 136;
  const strokeWidth = 12;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * Math.min(Math.max(batteryPercent, 0), 100)) / 100;

  // Signal bars component (iOS Style)
  const renderSignalBars = (strength = 0) => {
    const bars = [1, 2, 3, 4, 5];
    return (
      <View style={styles.signalBarsContainer}>
        {bars.map((bar) => {
          const isActive = bar <= strength;
          return (
            <View
              key={bar}
              style={[
                styles.signalBar,
                {
                  height: 5 + bar * 4,
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.outline,
                  opacity: isActive ? 1 : 0.35,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onManualRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Top Header Section (iOS Large Title Style) */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text variant="labelSmall" style={styles.eyebrow}>
            {activeAdapter?.name || 'HUAWEI HILINK'}
          </Text>
          <View
            style={[
              styles.pillBadge,
              {
                backgroundColor: isMockMode
                  ? 'rgba(175, 82, 222, 0.15)'
                  : connectionError
                  ? 'rgba(255, 59, 48, 0.15)'
                  : 'rgba(52, 199, 89, 0.15)',
              },
            ]}
          >
            <View
              style={[
                styles.pillDot,
                {
                  backgroundColor: isMockMode
                    ? '#AF52DE'
                    : connectionError
                    ? '#FF3B30'
                    : '#34C759',
                },
              ]}
            />
            <Text
              style={[
                styles.pillText,
                {
                  color: isMockMode
                    ? '#BF5AF2'
                    : connectionError
                    ? '#FF453A'
                    : '#30D158',
                },
              ]}
            >
              {isMockMode ? 'Demo Mode' : connectionError ? 'Offline' : 'Live Sync'}
            </Text>
          </View>
        </View>
        <Text style={[styles.largeTitle, { color: theme.colors.onSurface }]}>Dashboard</Text>
      </View>

      {/* Hero Circular Battery Card (iOS Fitness/Widget Aesthetic) */}
      <View style={[styles.iosCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
        <View style={styles.heroRow}>
          {/* Radial Ring */}
          <View style={styles.ringWrapper}>
            <Svg width={ringSize} height={ringSize}>
              <G rotation="-90" origin={`${ringSize / 2}, ${ringSize / 2}`}>
                {/* Background Ring Track */}
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  stroke={theme.colors.surfaceVariant}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Dynamic Progress Ring */}
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  stroke={batteryColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </G>
            </Svg>

            {/* Centered Percent Display */}
            <View style={styles.ringCenterContent}>
              <Text style={[styles.ringPercentText, { color: theme.colors.onSurface }]}>
                {batteryPercent}%
              </Text>
              {isCharging ? (
                <View style={styles.chargingBadge}>
                  <MaterialCommunityIcons name="lightning-bolt" size={13} color="#34C759" />
                  <Text style={styles.chargingBadgeText}>CHARGING</Text>
                </View>
              ) : (
                <Text style={styles.ringSublabel}>BATTERY</Text>
              )}
            </View>
          </View>

          {/* Right Summary Details */}
          <View style={styles.heroDetails}>
            <Text style={[styles.heroTitle, { color: theme.colors.onSurface }]}>
              {isCharging ? 'Device Charging' : 'Battery Power'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {isCharging
                ? 'Connected to power supply'
                : batteryPercent > 20
                ? 'Battery status normal'
                : 'Low battery — connect charger'}
            </Text>

            <View style={styles.heroStatChip}>
              <MaterialCommunityIcons
                name={isCharging ? 'power-plug' : 'battery-medium'}
                size={16}
                color={batteryColor}
              />
              <Text style={[styles.heroStatChipText, { color: theme.colors.onSurface }]}>
                {batteryPercent}% Capacity
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* iOS Section Title */}
      <Text style={styles.sectionHeader}>TELEMETRY & NETWORK</Text>

      {/* 2x2 iOS Grid of Inset Metric Cards */}
      <View style={styles.gridContainer}>
        {/* Card 1: Cellular Signal */}
        <View style={[styles.gridCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <View style={styles.gridHeader}>
            <View style={[styles.iosIconCircle, { backgroundColor: 'rgba(0, 122, 255, 0.12)' }]}>
              <MaterialCommunityIcons name="signal-cellular-outline" size={20} color="#007AFF" />
            </View>
            {renderSignalBars(status?.signalStrength ?? 0)}
          </View>
          <Text style={[styles.gridValue, { color: theme.colors.onSurface }]}>
            {status?.networkType || '4G / LTE'}
          </Text>
          <Text style={styles.gridLabel}>
            Cellular ({status?.signalStrength ?? 0}/5 Bars)
          </Text>
        </View>

        {/* Card 2: SIM Card Status */}
        <View style={[styles.gridCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <View style={styles.gridHeader}>
            <View
              style={[
                styles.iosIconCircle,
                {
                  backgroundColor:
                    status?.simStatus === 'ready'
                      ? 'rgba(52, 199, 89, 0.12)'
                      : 'rgba(255, 59, 48, 0.12)',
                },
              ]}
            >
              <MaterialCommunityIcons
                name={status?.simStatus === 'ready' ? 'sim' : 'sim-alert'}
                size={20}
                color={status?.simStatus === 'ready' ? '#34C759' : '#FF3B30'}
              />
            </View>
          </View>
          <Text
            style={[
              styles.gridValue,
              { color: status?.simStatus === 'ready' ? '#34C759' : '#FF3B30' },
            ]}
          >
            {status?.simStatus === 'ready' ? 'SIM Ready' : 'SIM Error'}
          </Text>
          <Text style={styles.gridLabel}>Card Provisioned</Text>
        </View>

        {/* Card 3: Connected Wi-Fi Clients */}
        <View style={[styles.gridCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <View style={styles.gridHeader}>
            <View style={[styles.iosIconCircle, { backgroundColor: 'rgba(175, 82, 222, 0.12)' }]}>
              <MaterialCommunityIcons name="devices" size={20} color="#AF52DE" />
            </View>
          </View>
          <Text style={[styles.gridValue, { color: theme.colors.onSurface }]}>
            {status?.connectedDevices ?? 1} {status?.connectedDevices === 1 ? 'Client' : 'Clients'}
          </Text>
          <Text style={styles.gridLabel}>Active on Wi-Fi</Text>
        </View>

        {/* Card 4: Gateway Status */}
        <View style={[styles.gridCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <View style={styles.gridHeader}>
            <View style={[styles.iosIconCircle, { backgroundColor: 'rgba(90, 200, 250, 0.12)' }]}>
              <MaterialCommunityIcons name="router-wireless" size={20} color="#5AC8FA" />
            </View>
          </View>
          <Text style={[styles.gridValue, { color: theme.colors.onSurface }]}>
            {activeAdapter?.gatewayIp || '192.168.8.1'}
          </Text>
          <Text style={styles.gridLabel}>Gateway Subnet</Text>
        </View>
      </View>

      {/* iOS Section Title */}
      <Text style={styles.sectionHeader}>CONTROLS & SIMULATION</Text>

      {/* iOS Inset Grouped Table View */}
      <View style={[styles.iosGroupedCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
        {/* Row 1: Demo Switch */}
        <View style={styles.iosRow}>
          <View style={[styles.iosSettingsIcon, { backgroundColor: '#AF52DE' }]}>
            <MaterialCommunityIcons name="flask" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.iosRowContent}>
            <Text style={[styles.iosRowTitle, { color: theme.colors.onSurface }]}>Demo Mode</Text>
            <Text style={styles.iosRowSubtitle}>Simulate live metrics without physical MiFi</Text>
          </View>
          <Switch
            value={isMockMode}
            onValueChange={(val) => toggleMockMode(val)}
            trackColor={{ false: theme.colors.outline, true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.iosDivider, { backgroundColor: theme.colors.outline }]} />

        {/* Row 2: Re-Scan Gateways */}
        <TouchableOpacity
          style={styles.iosRow}
          onPress={() => runAutoDetect()}
          activeOpacity={0.7}
          disabled={isDetecting}
        >
          <View style={[styles.iosSettingsIcon, { backgroundColor: '#007AFF' }]}>
            {isDetecting ? (
              <ActivityIndicator size={16} color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name="radar" size={18} color="#FFFFFF" />
            )}
          </View>
          <View style={styles.iosRowContent}>
            <Text style={[styles.iosRowTitle, { color: theme.colors.onSurface }]}>
              {isDetecting ? 'Scanning Subnets...' : 'Re-Scan Local Gateways'}
            </Text>
            <Text style={styles.iosRowSubtitle}>Probe 192.168.8.1, 100.1, 1.1</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Live Polling Caption */}
      <Text style={styles.footerNote}>
        Syncing with gateway every 5s • {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}` : 'Live'}
      </Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#8E8E93',
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.35,
  },
  iosCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ringWrapper: {
    width: 136,
    height: 136,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenterContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercentText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  ringSublabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  chargingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  chargingBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34C759',
    letterSpacing: 0.5,
  },
  heroDetails: {
    flex: 1,
    marginLeft: 18,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
    marginBottom: 12,
  },
  heroStatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  heroStatChipText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 6,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridCard: {
    width: (width - 44) / 2,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iosIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridValue: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  gridLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  signalBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 25,
  },
  signalBar: {
    width: 3.5,
    marginHorizontal: 1.5,
    borderRadius: 2,
  },
  iosGroupedCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  iosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iosSettingsIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iosRowContent: {
    flex: 1,
  },
  iosRowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  iosRowSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  iosDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
});
