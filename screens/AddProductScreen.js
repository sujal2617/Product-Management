import React, {
  useState,
  useRef,
} from 'react';

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
  ActivityIndicator,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import { supabase } from '../lib/supabase';

import { escapeLike } from '../utils/validation';

import {
  COLORS,
  SHADOW,
  SPACING,
  RADIUS,
} from '../theme';

export default function AddProductScreen({
  navigation,
}) {
  const [name, setName] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const inFlight = useRef(false);
  
    const runGuarded = async (task) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setSaving(true);
      try {
        await task();
      } finally {
        inFlight.current = false;
        setSaving(false);
      }
    };
  
const handleSave = () =>
    runGuarded(async () => {
      const trimmed = name.trim();

      if (!trimmed) {
        Alert.alert(
          'Missing Fields',
          'Please enter product name'
        );

        return;
      }

      setSaving(true);

      const {
        data: existing,
        error: checkError,
      } = await supabase
        .from('products')
        .select('id')
        .ilike(
          'name',
          escapeLike(trimmed)
        )
        .limit(1);

      if (checkError) {
        setSaving(false);

        Alert.alert(
          'Error',
          'Could not check existing products'
        );

        return;
      }

      if (existing?.length) {
        setSaving(false);

        Alert.alert(
          'Duplicate Product',
          'Product already exists'
        );

        return;
      }

      const { error } =
        await supabase
          .from('products')
          .insert({
            name: trimmed,
          });

      setSaving(false);

      if (error) {
        Alert.alert(
          'Error',
          'Failed to add product'
        );

        return;
      }

      Alert.alert(
        'Success',
        'Product Added',
        [
          {
            text: 'OK',
            onPress: () =>
              navigation.goBack(),
          },
        ]
      );
    });

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scroll
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text
          style={styles.heading}
        >
          Add Product
        </Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Product Name"
            placeholderTextColor={
              COLORS.subText
            }
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            selectionColor={
              COLORS.primary
            }
          />

          <TouchableOpacity
            style={[
              styles.button,
              saving && styles.disabled,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
            <Text
              style={
                styles.buttonText
              }
            >
              Save Product
            </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    flex: {
      flex: 1,
    },

    disabled: {
      opacity: 0.6,
    },

    safe: {
      flex: 1,

      backgroundColor:
        COLORS.background,
    },

    scroll: {
      padding: SPACING.lg,
    },

    heading: {
      fontSize: 32,

      fontWeight: '800',

      color: COLORS.text,

      marginBottom: 24,
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

      padding: 18,

      marginBottom: 18,

      fontSize: 20,

      fontWeight: '600',

      color: COLORS.text,
    },

    button: {
      backgroundColor:
        COLORS.primary,

      borderRadius:
        RADIUS.md,

      padding: 18,

      alignItems: 'center',
    },

    buttonText: {
      color: '#eef7ff',

      fontWeight: '700',

      fontSize: 16,
    },
  });