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
  COLORS,
  SHADOW,
  RADIUS,
  SPACING,
} from '../theme';

export default function LoginScreen({
  navigation,
}) {
  const [email, setEmail] =
    useState('');

  const [password,
    setPassword] =
    useState('');

  const [showPassword,
    setShowPassword] =
    useState(false);

  const handleLogin =
    async () => {
      if (
        !email ||
        !password
      ) {
        Alert.alert(
          'Missing Fields',
          'Please enter email/phone and password'
        );

        return;
      }

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
          const {
            data,
            error,
          } = await supabase
            .from('users')
            .select('email')
            .eq(
              'phone',
              loginEmail
            )
            .single();

          if (
            error ||
            !data
          ) {
            Alert.alert(
              'Login Error',
              'Phone number not found'
            );

            return;
          }

          loginEmail =
            data.email;
        }

        // FIREBASE LOGIN
        await signInWithEmailAndPassword(
          auth,
          loginEmail,
          password
        );

        Alert.alert(
          'Success',
          'Login Successful'
        );
      } catch (error) {
        console.log(error);

        let message =
          'Login failed';

        if (
          error.code ===
          'auth/invalid-credential'
        ) {
          message =
            'Invalid email/phone or password';
        }

        if (
          error.code ===
          'auth/user-not-found'
        ) {
          message =
            'User not found';
        }

        if (
          error.code ===
          'auth/wrong-password'
        ) {
          message =
            'Incorrect password';
        }

        Alert.alert(
          'Login Error',
          message
        );
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
                color="#fff"
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
              style={
                styles.loginButton
              }
              onPress={
                handleLogin
              }
            >
              <Text
                style={
                  styles.buttonText
                }
              >
                Login
              </Text>
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

const styles =
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
      color: '#fff',
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