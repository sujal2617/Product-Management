import React, {
  useState,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '../lib/firebase';

import { supabase } from '../lib/supabase';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import {
  useTheme,
  SHADOW,
  RADIUS,
  SPACING,
} from '../theme';

const CREDENTIAL_MESSAGE =
  'Wrong email/phone or password';

function friendlyMessage(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-email':
      return CREDENTIAL_MESSAGE;
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'No internet connection. Please check your network.';
    default:
      return 'Login failed. Please try again.';
  }
}

export default function LoginScreen({
  navigation,
}) {
  const COLORS = useTheme();

  const styles = React.useMemo(
    () => makeStyles(COLORS),
    [COLORS]
  );

  const [email, setEmail] =
    useState('');

  const [password,
    setPassword] =
    useState('');

  const [showPassword,
    setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const handleLogin =
    async () => {
      if (loading) return;

      if (
        !email.trim() ||
        !password
      ) {
        Alert.alert(
          'Missing Fields',
          'Please enter email/phone and password'
        );

        return;
      }

      setLoading(true);

      try {
        let loginEmail =
          email.trim();

        // CHECK IF PHONE NUMBER
        const isPhone =
          /^[0-9]+$/.test(
            loginEmail
          );

        // IF PHONE → GET EMAIL FROM SUPABASE
        if (isPhone) {
          let {
            data: phoneEmail,
            error,
          } = await supabase.rpc(
            'login_email_for_phone',
            { p_phone: loginEmail }
          );

          // RPC not created yet (SQL 001 not applied): use the old lookup.
          if (error?.code === 'PGRST202') {
            const old = await supabase
              .from('users')
              .select('email')
              .eq('phone', loginEmail)
              .single();

            phoneEmail = old.data?.email;
            error = old.error;
          }

          if (
            error ||
            !phoneEmail
          ) {
            Alert.alert(
              'Login Error',
              CREDENTIAL_MESSAGE
            );

            return;
          }

          loginEmail =
            phoneEmail;
        }

        // FIREBASE LOGIN
        await signInWithEmailAndPassword(
          auth,
          loginEmail,
          password
        );

        // Reload the token once so a newly set role claim is included.
        await auth.currentUser?.getIdToken(true);

        // Auth listener in App.js navigates on success.
      } catch (error) {
        if (__DEV__) console.warn(error?.code);

        Alert.alert(
          'Login Error',
          friendlyMessage(error?.code)
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS ===
          'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.scroll
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* HEADER */}
          <View style={styles.top}>
            <View
              style={
                styles.logoBox
              }
            >
              <MaterialIcons
                name="inventory-2"
                size={60}
                color={COLORS.onPrimary}
              />
            </View>

            <Text
              style={
                styles.title
              }
            >
              Product Manager
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Login to continue
            </Text>
          </View>

          {/* LOGIN CARD */}
          <View style={styles.card}>
            {/* EMAIL OR PHONE */}
            <TextInput
              style={styles.input}
              placeholder="Email or Phone Number"
              placeholderTextColor={
                COLORS.subText
              }
              value={email}
              onChangeText={
                setEmail
              }
              autoCapitalize="none"
            />

            {/* PASSWORD */}
            <View
              style={
                styles.passwordBox
              }
            >
              <TextInput
                style={
                  styles.passwordInput
                }
                placeholder="Password"
                placeholderTextColor={
                  COLORS.subText
                }
                value={password}
                onChangeText={
                  setPassword
                }
                secureTextEntry={
                  !showPassword
                }
              />

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                onPress={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                <MaterialIcons
                  name={
                    showPassword
                      ? 'visibility'
                      : 'visibility-off'
                  }
                  size={24}
                  color={
                    COLORS.subText
                  }
                />
              </TouchableOpacity>
            </View>

            {/* LOGIN BUTTON */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && { opacity: 0.6 },
              ]}
              onPress={
                handleLogin
              }
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.onPrimary} />
              ) : (
              <Text
                style={
                  styles.buttonText
                }
              >
                Login
              </Text>
              )}
            </TouchableOpacity>

            {/* REGISTER */}
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  'Register'
                )
              }
            >
              <Text
                style={
                  styles.registerText
                }
              >
                Don't have an account?
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

    scroll: {
      flexGrow: 1,
      justifyContent:
        'center',
      padding:
        SPACING.lg,
    },

    top: {
      alignItems: 'center',
      marginBottom: 40,
    },

    logoBox: {
      width: 120,
      height: 120,
      borderRadius: 60,

      backgroundColor:
        COLORS.primary,

      justifyContent:
        'center',

      alignItems: 'center',

      marginBottom: 20,

      ...SHADOW,
    },

    title: {
      fontSize: 34,
      fontWeight: '800',
      color: COLORS.text,
      textAlign: 'center',
    },

    subtitle: {
      marginTop: 10,
      fontSize: 16,
      color: COLORS.subText,
    },

    card: {
      backgroundColor:
        COLORS.white,

      borderRadius:
        RADIUS.lg,

      padding:
        SPACING.xl,

      ...SHADOW,
    },

    input: {
      backgroundColor:
        COLORS.inputBg,

      borderRadius:
        RADIUS.sm,

      padding: 16,

      marginBottom: 18,

      fontSize: 16,

      color: COLORS.text,
    },

    passwordBox: {
      backgroundColor:
        COLORS.inputBg,

      borderRadius:
        RADIUS.sm,

      paddingHorizontal: 16,

      height: 58,

      flexDirection: 'row',

      alignItems: 'center',

      marginBottom: 24,
    },

    passwordInput: {
      flex: 1,
      fontSize: 16,
      color: COLORS.text,
    },

    loginButton: {
      backgroundColor:
        COLORS.primary,

      borderRadius:
        RADIUS.md,

      padding: 18,

      alignItems: 'center',

      marginBottom: 22,
    },

    buttonText: {
      color: COLORS.onPrimary,
      fontSize: 17,
      fontWeight: '700',
    },

    registerText: {
      textAlign: 'center',
      color: COLORS.primary,
      fontSize: 15,
      fontWeight: '600',
    },
  });