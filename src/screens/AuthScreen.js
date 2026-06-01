import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, LockKeyhole, UserPlus } from 'lucide-react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionLabel } from '../components/SectionLabel';
import { authenticateUser, createUser } from '../database/database';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export const AuthScreen = ({ onAuthenticated }) => {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isRegistering = mode === 'register';

  const resetFeedback = () => {
    setError('');
    setMessage('');
  };

  const switchMode = () => {
    resetFeedback();
    setMode(isRegistering ? 'login' : 'register');
  };

  const handleSubmit = async () => {
    resetFeedback();

    if (isRegistering && password.trim() !== confirmPassword.trim()) {
      setError('As senhas informadas não conferem.');
      return;
    }

    setLoading(true);

    try {
      const user = isRegistering
        ? await createUser({ name, email, password })
        : await authenticateUser({ email, password });

      setMessage(isRegistering ? 'Cadastro criado.' : 'Login validado.');
      onAuthenticated(user);
    } catch (authError) {
      setError(authError.message || 'Não foi possível autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <LinearGradient colors={['#474747', '#292929']} style={styles.brandMark}>
            <LineChart color={colors.foreground} size={32} strokeWidth={2} />
            <View style={styles.brandDot} />
          </LinearGradient>
          <Text style={styles.brand}>NightBull</Text>
          <Text style={styles.title}>{isRegistering ? 'Criar conta' : 'Acessar carteira'}</Text>
          <Text style={styles.subtitle}>
            {isRegistering
              ? 'Cadastre um usuário local para registrar transações.'
              : 'Entre com seu e-mail para acessar a carteira local.'}
          </Text>
        </View>

        <View style={styles.card}>
          {isRegistering && (
            <>
              <SectionLabel>Nome</SectionLabel>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="words"
                style={styles.input}
              />
            </>
          )}

          <SectionLabel style={isRegistering ? styles.fieldLabel : undefined}>E-mail</SectionLabel>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="usuario@email.com"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={styles.input}
          />

          <SectionLabel style={styles.fieldLabel}>Senha</SectionLabel>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="mínimo 4 caracteres"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry
            style={styles.input}
          />

          {isRegistering && (
            <>
              <SectionLabel style={styles.fieldLabel}>Confirmar senha</SectionLabel>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="repita a senha"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                style={styles.input}
              />
            </>
          )}

          {!!error && <Text style={styles.errorText}>{error}</Text>}
          {!!message && <Text style={styles.messageText}>{message}</Text>}

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, loading && styles.disabled]}
          >
            {loading ? (
              <ActivityIndicator color={colors.foreground} />
            ) : (
              <>
                {isRegistering ? (
                  <UserPlus color={colors.foreground} size={16} strokeWidth={2} />
                ) : (
                  <LockKeyhole color={colors.foreground} size={16} strokeWidth={2} />
                )}
                <Text style={styles.primaryButtonText}>{isRegistering ? 'Cadastrar' : 'Entrar'}</Text>
              </>
            )}
          </Pressable>
          <Pressable onPress={switchMode} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>
              {isRegistering ? 'Já tenho cadastro' : 'Criar novo cadastro'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
    paddingTop: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 26,
  },
  brandMark: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    position: 'relative',
    width: 58,
  },
  brandDot: {
    backgroundColor: colors.success,
    borderRadius: 5,
    height: 10,
    position: 'absolute',
    right: 8,
    top: 8,
    width: 10,
  },
  brand: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 2.4,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.foreground,
    fontFamily: fonts.displayBold,
    fontSize: 31,
    letterSpacing: -0.7,
    marginTop: 8,
  },
  subtitle: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 310,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  fieldLabel: {
    marginTop: 18,
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.foreground,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  errorText: {
    color: colors.danger,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },
  messageText: {
    color: colors.success,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 50,
  },
  primaryButtonText: {
    color: colors.foreground,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    minHeight: 48,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.58,
  },
});
