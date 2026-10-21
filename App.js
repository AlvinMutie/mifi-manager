import React from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { RouterProvider } from './src/context/RouterContext';
import { customDarkTheme, customLightTheme } from './src/theme/theme';
import DashboardScreen from './src/screens/DashboardScreen';
import DeviceDetailsScreen from './src/screens/DeviceDetailsScreen';
import ShareWifiScreen from './src/screens/ShareWifiScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== 'light'; // Default to sleek dark mode
  const paperTheme = isDark ? customDarkTheme : customLightTheme;

  const navTheme = isDark
    ? {
        ...NavDarkTheme,
        colors: {
          ...NavDarkTheme.colors,
          background: paperTheme.colors.background,
          card: paperTheme.colors.surface,
          text: paperTheme.colors.onSurface,
          border: paperTheme.colors.outline,
          primary: paperTheme.colors.primary,
        },
      }
    : {
        ...NavLightTheme,
        colors: {
          ...NavLightTheme.colors,
          background: paperTheme.colors.background,
          card: paperTheme.colors.surface,
          text: paperTheme.colors.onSurface,
          border: paperTheme.colors.outline,
          primary: paperTheme.colors.primary,
        },
      };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <RouterProvider>
          <NavigationContainer theme={navTheme}>
            <Tab.Navigator
              initialRouteName="Dashboard"
              screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName = 'view-dashboard';
                  if (route.name === 'Dashboard') {
                    iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
                  } else if (route.name === 'Device Details') {
                    iconName = focused ? 'router-wireless' : 'router-wireless-settings';
                  } else if (route.name === 'Share Wi-Fi') {
                    iconName = focused ? 'qrcode-scan' : 'qrcode';
                  }
                  return <MaterialCommunityIcons name={iconName} size={24} color={color} />;
                },
                tabBarActiveTintColor: paperTheme.colors.primary,
                tabBarInactiveTintColor: paperTheme.colors.onSurfaceVariant,
                tabBarLabelStyle: {
                  fontSize: 11,
                  fontWeight: '600',
                  marginTop: -2,
                },
                tabBarStyle: {
                  backgroundColor: paperTheme.colors.surface,
                  borderTopColor: paperTheme.colors.outline,
                  borderTopWidth: StyleSheet.hairlineWidth,
                  height: 60,
                  paddingBottom: 8,
                  paddingTop: 6,
                },
              })}
            >
              <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                  tabBarLabel: 'Dashboard',
                }}
              />
              <Tab.Screen
                name="Device Details"
                component={DeviceDetailsScreen}
                options={{
                  tabBarLabel: 'Hardware',
                }}
              />
              <Tab.Screen
                name="Share Wi-Fi"
                component={ShareWifiScreen}
                options={{
                  tabBarLabel: 'Share Wi-Fi',
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </RouterProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
