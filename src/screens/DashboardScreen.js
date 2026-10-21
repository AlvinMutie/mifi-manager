import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  ProgressBar,
  Switch,
  IconButton,
  Surface,
  useTheme,
  ActivityIndicator,
  Banner,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from '../context/RouterContext';

export default function DashboardScreen() {
  const theme = useTheme();
  const {
    activeAdapter,
    status,
    isDetecting,
    isMockMode,
    connectionError,
    lastUpdated,
    detectionMessage,
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

  // Battery color helper
  const getBatteryColor = (percent) => {
    if (percent > 50) return '#10b981'; // Green
    if (percent > 20) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  // Signal bars component
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
                  height: 6 + bar * 4,
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.outline,
                  opacity: isActive ? 1 : 0.4,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // Sim Status details
  const getSimChipInfo = (simStatus) => {
    switch (simStatus) {
      case 'ready':
        return { label: 'SIM Ready', icon: 'sim', color: '#10b981' };
      case 'missing':
        return { label: 'No SIM Inserted', icon: 'sim-alert', color: '#ef4444' };
      case 'pin_required':
        return { label: 'PIN Locked', icon: 'lock-alert', color: '#f59e0b' };
      default:
        return { label: 'SIM Error', icon: 'alert-circle', color: '#ef4444' };
    }
  };

  const simInfo = getSimChipInfo(status?.simStatus || 'ready');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onManualRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Top Status & Brand Header */}
      <Surface style={[styles.headerCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text variant="titleMedium" style={{ fontWeight: '700', color: theme.colors.onSurface }}>
              {activeAdapter?.name || 'MiFi Router'}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Gateway: {activeAdapter?.gatewayIp || '192.168.8.1'}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Chip
              icon={isMockMode ? 'flask-outline' : 'wifi-check'}
              style={{
                backgroundColor: isMockMode ? '#8b5cf622' : '#10b98122',
              }}
              textStyle={{
                color: isMockMode ? '#a78bfa' : '#34d399',
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {isMockMode ? 'Demo Mode' : 'Live Gateway'}
            </Chip>
          </View>
        </View>

        {/* Demo Mode Toggle Switch */}
        <View style={styles.mockToggleRow}>
          <View style={styles.mockToggleText}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
              Simulate Live Data (Demo)
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontSize: 11 }}>
              Test UI and 5s polling without physical router
            </Text>
          </View>
          <Switch
            value={isMockMode}
            onValueChange={(val) => toggleMockMode(val)}
            color={theme.colors.primary}
          />
        </View>
      </Surface>

      {/* Auto-detection or Offline notification banner */}
      {isDetecting ? (
        <Surface style={[styles.detectingBox, { backgroundColor: theme.colors.surfaceVariant }]}>
          <ActivityIndicator animating size="small" color={theme.colors.primary} />
          <Text variant="bodySmall" style={{ marginLeft: 10, color: theme.colors.onSurfaceVariant }}>
            {detectionMessage}
          </Text>
        </Surface>
      ) : connectionError && !isMockMode ? (
        <Banner
          visible
          actions={[
            {
              label: 'Turn on Demo Mode',
              onPress: () => toggleMockMode(true),
            },
            {
              label: 'Retry Gateway',
              onPress: () => runAutoDetect(),
            },
          ]}
          icon="wifi-off"
          style={{ borderRadius: 12, marginBottom: 16 }}
        >
          {connectionError}. Ensure your phone is connected to the MiFi router Wi-Fi, or switch to Demo Mode.
        </Banner>
      ) : null}

      {/* Polling indicator bar */}
      <View style={styles.pollingStatusRow}>
        <View style={styles.livePulseDot} />
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>
          Live: Polling every 5 seconds
        </Text>
        {lastUpdated ? (
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Updated: {new Date(lastUpdated).toLocaleTimeString()}
          </Text>
        ) : null}
        <IconButton
          icon="refresh"
          size={18}
          iconColor={theme.colors.primary}
          onPress={onManualRefresh}
          style={{ margin: 0, padding: 0 }}
        />
      </View>

      {/* Metric 1: Battery Card */}
      <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]} mode="elevated">
        <Card.Content>
          <View style={styles.metricCardHeader}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name={
                  status?.isCharging
                    ? 'battery-charging'
                    : (status?.batteryPercent || 0) > 20
                    ? 'battery'
                    : 'battery-alert'
                }
                size={28}
                color={getBatteryColor(status?.batteryPercent || 0)}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                Battery Level
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {status?.isCharging ? 'Device is currently charging' : 'Running on internal battery'}
              </Text>
            </View>
            <Text
              variant="headlineMedium"
              style={{
                fontWeight: '800',
                color: getBatteryColor(status?.batteryPercent || 0),
              }}
            >
              {status?.batteryPercent ?? '--'}%
            </Text>
          </View>

          <ProgressBar
            progress={(status?.batteryPercent || 0) / 100}
            color={getBatteryColor(status?.batteryPercent || 0)}
            style={styles.batteryProgressBar}
          />
        </Card.Content>
      </Card>

      {/* Metric 2: Cellular & SIM Card Card */}
      <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]} mode="elevated">
        <Card.Content>
          <View style={styles.metricCardHeader}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="signal-cellular-3" size={28} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                Cellular Signal
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Network: {status?.networkType || 'Searching...'}
              </Text>
            </View>
            {renderSignalBars(status?.signalStrength ?? 0)}
          </View>

          <View style={styles.simRow}>
            <Chip
              icon={simInfo.icon}
              style={{ backgroundColor: `${simInfo.color}20` }}
              textStyle={{ color: simInfo.color, fontWeight: '600' }}
            >
              {simInfo.label}
            </Chip>

            <Chip
              icon="swap-vertical"
              style={{ backgroundColor: theme.colors.surfaceVariant, marginLeft: 8 }}
              textStyle={{ color: theme.colors.onSurface }}
            >
              {status?.networkType || '4G / LTE'}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Metric 3: Connection & Connected Clients */}
      <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]} mode="elevated">
        <Card.Content>
          <View style={styles.metricCardHeader}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="devices" size={28} color={theme.colors.secondary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                Connected Devices
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Active MiFi Wi-Fi clients
              </Text>
            </View>
            <Text variant="headlineMedium" style={{ fontWeight: '800', color: theme.colors.secondary }}>
              {status?.connectedDevices ?? 1}
            </Text>
          </View>

          <View style={styles.connectionDetailsRow}>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      status?.connectionStatus === 'connected'
                        ? '#10b981'
                        : status?.connectionStatus === 'connecting'
                        ? '#f59e0b'
                        : '#ef4444',
                  },
                ]}
              />
              <Text variant="bodyMedium" style={{ textTransform: 'capitalize', fontWeight: '500' }}>
                Status: {status?.connectionStatus || 'Connected'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Re-Detect Gateway Button */}
      <Button
        mode="outlined"
        icon="radar"
        onPress={() => runAutoDetect()}
        loading={isDetecting}
        disabled={isDetecting}
        style={styles.reDetectButton}
        textColor={theme.colors.primary}
      >
        Re-Scan Local Gateways
      </Button>
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
  headerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 8,
  },
  mockToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#374151',
  },
  mockToggleText: {
    flex: 1,
  },
  detectingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  pollingStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  metricCard: {
    borderRadius: 16,
    marginBottom: 14,
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  batteryProgressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 14,
    backgroundColor: '#374151',
  },
  signalBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 28,
  },
  signalBar: {
    width: 4,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  simRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  connectionDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#374151',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  reDetectButton: {
    marginTop: 8,
    borderRadius: 12,
  },
});
