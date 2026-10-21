import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  Card,
  Text,
  List,
  Divider,
  Button,
  TextInput,
  useTheme,
  Snackbar,
  IconButton,
} from 'react-native-paper';
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
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const copyToClipboard = async (text, label) => {
    if (!text || text === 'N/A') return;
    await Clipboard.setStringAsync(text);
    setSnackbarMsg(`Copied ${label} to clipboard`);
    setSnackbarVisible(true);
  };

  const handleCustomConnect = () => {
    if (customIp.trim()) {
      runAutoDetect(customIp.trim());
    }
  };

  const infoItems = [
    {
      title: 'Device Model',
      value: deviceInfo?.deviceName || deviceInfo?.model || 'Huawei Mobile WiFi',
      icon: 'router-wireless',
    },
    {
      title: 'IMEI',
      value: deviceInfo?.imei || 'N/A',
      icon: 'barcode-scan',
      canCopy: true,
    },
    {
      title: 'Software / Firmware',
      value: deviceInfo?.softwareVersion || 'N/A',
      icon: 'cellphone-arrow-down',
    },
    {
      title: 'Hardware Version',
      value: deviceInfo?.hardwareVersion || 'N/A',
      icon: 'chip',
    },
    {
      title: 'Gateway IP',
      value: deviceInfo?.gatewayIp || activeAdapter?.gatewayIp || '192.168.8.1',
      icon: 'ip-network',
      canCopy: true,
    },
    {
      title: 'MAC Address',
      value: deviceInfo?.macAddress || 'N/A',
      icon: 'ethernet',
      canCopy: true,
    },
    {
      title: 'WAN IP (Cellular)',
      value: deviceInfo?.wanIpAddress || 'N/A',
      icon: 'earth',
    },
    {
      title: 'Web UI Version',
      value: deviceInfo?.webUiVersion || 'N/A',
      icon: 'application-brackets',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Device Overview Banner */}
      <Card style={[styles.headerCard, { backgroundColor: theme.colors.surface }]} mode="elevated">
        <Card.Content style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <List.Icon icon="router-wireless-settings" color={theme.colors.primary} />
          </View>
          <View style={styles.headerDetails}>
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>
              {deviceInfo?.deviceName || 'MiFi Device'}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Protocol: {activeAdapter?.name || 'Huawei HiLink'}
            </Text>
          </View>
          <Button
            mode="text"
            icon="refresh"
            compact
            onPress={() => refreshDeviceInfo()}
            textColor={theme.colors.primary}
          >
            Refresh
          </Button>
        </Card.Content>
      </Card>

      {/* Hardware Specifications List */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
        <Card.Title title="Hardware & Network Information" titleVariant="titleMedium" />
        <Card.Content style={{ paddingHorizontal: 0 }}>
          {infoItems.map((item, index) => (
            <React.Fragment key={item.title}>
              <List.Item
                title={item.title}
                description={item.value}
                titleStyle={{ fontSize: 13, color: theme.colors.onSurfaceVariant }}
                descriptionStyle={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: theme.colors.onSurface,
                  marginTop: 2,
                }}
                left={(props) => (
                  <List.Icon {...props} icon={item.icon} color={theme.colors.primary} />
                )}
                right={(props) =>
                  item.canCopy && item.value !== 'N/A' ? (
                    <IconButton
                      {...props}
                      icon="content-copy"
                      size={18}
                      iconColor={theme.colors.onSurfaceVariant}
                      onPress={() => copyToClipboard(item.value, item.title)}
                    />
                  ) : null
                }
              />
              {index < infoItems.length - 1 && <Divider style={styles.divider} />}
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>

      {/* Custom Gateway Override Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
        <Card.Title
          title="Custom Gateway Configuration"
          subtitle="If your router uses a custom subnet (e.g. 192.168.100.1)"
          titleVariant="titleMedium"
        />
        <Card.Content>
          <View style={styles.customIpRow}>
            <TextInput
              mode="outlined"
              label="Gateway IP Address"
              placeholder="192.168.8.1"
              value={customIp}
              onChangeText={setCustomIp}
              keyboardType="numeric"
              style={styles.textInput}
              dense
            />
            <Button
              mode="contained"
              onPress={handleCustomConnect}
              loading={isDetecting}
              disabled={!customIp.trim() || isDetecting}
              style={styles.connectButton}
            >
              Connect
            </Button>
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
  headerCard: {
    borderRadius: 16,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  headerDetails: {
    flex: 1,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
  },
  divider: {
    marginHorizontal: 16,
  },
  customIpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  textInput: {
    flex: 1,
    marginRight: 8,
  },
  connectButton: {
    borderRadius: 8,
    marginTop: 6,
  },
});
