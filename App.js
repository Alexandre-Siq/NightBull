import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, StyleSheet, Text, View } from 'react-native';
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
import { AuthScreen } from './src/screens/AuthScreen';
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
  const [currentUser, setCurrentUser] = useState(null);
  const transitionOpacity = useRef(new Animated.Value(1)).current;
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    JetBrainsMono_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = colors.background;
      document.body.style.backgroundColor = colors.background;
      document.body.style.margin = '0';
    }
  }, []);

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

  const transitionToUser = (nextUser) => {
    Animated.timing(transitionOpacity, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setCurrentUser(nextUser);
      Animated.timing(transitionOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  };

  if (!fontsLoaded || !databaseReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.splash}>
          <StatusBar style="light" backgroundColor={colors.background} />
          <ActivityIndicator color={colors.foreground} />
          <Text style={styles.splashTitle}>NightBull</Text>
          <Text style={styles.splashText}>{databaseError || 'Preparando carteira local'}</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" backgroundColor={colors.background} />
        <Animated.View style={[styles.root, { opacity: transitionOpacity }]}>
          {currentUser ? (
            <NavigationContainer theme={navigationTheme}>
              <AppNavigator currentUser={currentUser} onSignOut={() => transitionToUser(null)} />
            </NavigationContainer>
          ) : (
            <AuthScreen onAuthenticated={transitionToUser} />
          )}
        </Animated.View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
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
