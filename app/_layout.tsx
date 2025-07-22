import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <CartProvider>
          <Stack initialRouteName="onboarding" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="auth-choice" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="home" />
            <Stack.Screen name="verify-otp" />
            <Stack.Screen name="protein-picks" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </CartProvider>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
