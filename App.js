import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import {
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeDatabase } from './src/database/database';
import { colors } from './src/theme/colors';
import { fonts } from './src/theme/typography';

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    border: colors.border,
    card: colors.card,
    notification: colors.success,
    primary: colors.foreground,
    text: colors.foreground,
  },
};

export default function App() {
  const [databaseReady, setDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState('');
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    JetBrainsMono_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    let mounted = true;

    initializeDatabase()
      .then(() => {
        if (mounted) {
          setDatabaseReady(true);
        }
      })
      .catch((error) => {
        if (mounted) {
          setDatabaseError(error.message || 'Falha ao iniciar o banco local.');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!fontsLoaded || !databaseReady) {
    return (
      <View style={styles.splash}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.foreground} />
        <Text style={styles.splashTitle}>NightBull</Text>
        <Text style={styles.splashText}>{databaseError || 'Preparando carteira local'}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  splashTitle: {
    color: colors.foreground,
    fontFamily: fonts.displayBold,
    fontSize: 28,
    letterSpacing: -0.4,
    marginTop: 18,
  },
  splashText: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
});
