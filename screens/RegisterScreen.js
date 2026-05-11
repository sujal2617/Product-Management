import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  createUserWithEmailAndPassword,
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

export default function RegisterScreen({
  navigation,
}) {
  const [name, setName] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password,
    setPassword] =
    useState('');

  const [showPassword,
    setShowPassword] =
    useState(false);

  const handleRegister =
    async () => {
      if (
        !name ||
        !phone ||
        !email ||
        !password
      ) {
        Alert.alert(
          'Missing Fields',
          'Please fill all fields'
        );

        return;
      }

      try {
        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email
              .trim()
              .toLowerCase(),
            password
          );

        const firebaseUser =
          userCredential.user;

        let role = 'user';

        if (
          email
            .trim()
            .toLowerCase() ===
          'sujalpattewar26@gmail.com'
        ) {
          role = 'admin';
        }

        const { error } =
          await supabase
            .from('users')
            .insert({
              id: firebaseUser.uid,

              name:
                name.trim(),

              phone:
                phone.trim(),

              email:
                email
                  .trim()
                  .toLowerCase(),

              role,
            });

        if (error) {
          Alert.alert(
            'Database Error',
            error.message
          );

          return;
        }

        Alert.alert(
          'Success',
          'Account Created'
        );
      } catch (error) {
        if (
          error.code ===
          'auth/email-already-in-use'
        ) {
          Alert.alert(
            'Email Exists',
            'Email already registered'
          );
        } else {
          Alert.alert(
            'Registration Failed',
            'Something went wrong'
          );
        }
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
          <View style={styles.topBox}>
            <Text
              style={
                styles.heading
              }
            >
              Create Account
            </Text>

            <Text
              style={
                styles.subHeading
              }
            >
              Register to continue
            </Text>
          </View>

          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

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

            <TouchableOpacity
              style={
                styles.button
              }
              onPress={
                handleRegister
              }
            >
              <Text
                style={
                  styles.buttonText
                }
              >
                Register
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.goBack()
              }
            >
              <Text
                style={styles.link}
              >
                Already have an
                account?
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

      padding: SPACING.lg,
    },

    topBox: {
      marginBottom: 30,
    },

    heading: {
      fontSize: 38,
      fontWeight: '800',
      color: COLORS.text,
    },

    subHeading: {
      fontSize: 16,
      color: COLORS.subText,
      marginTop: 6,
    },

    card: {
      backgroundColor:
        COLORS.white,

      borderRadius:
        RADIUS.lg,

      padding: SPACING.lg,

      ...SHADOW,
    },

    input: {
      backgroundColor:
        COLORS.inputBg,

      borderRadius:
        RADIUS.sm,

      padding: 16,

      marginBottom: 16,

      fontSize: 16,

      color: COLORS.text,
    },

    passwordBox: {
      backgroundColor:
        COLORS.inputBg,

      borderRadius:
        RADIUS.sm,

      paddingHorizontal: 16,

      flexDirection: 'row',

      alignItems: 'center',

      marginBottom: 18,
    },

    passwordInput: {
      flex: 1,
      paddingVertical: 16,
      fontSize: 16,
      color: COLORS.text,
    },

    button: {
      backgroundColor:
        COLORS.primary,

      borderRadius:
        RADIUS.sm,

      padding: 17,

      alignItems: 'center',
    },

    buttonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },

    link: {
      textAlign: 'center',
      marginTop: 20,
      color: COLORS.primary,
      fontWeight: '700',
    },
  });