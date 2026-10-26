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
  useTheme,
  SHADOW,
  SPACING,
  RADIUS,
} from '../theme';

import { useToast } from '../components/Toast';

export default function EditProductScreen({
  route,
  navigation,
}) {
  const COLORS = useTheme();

  const toast = useToast();

  const styles = React.useMemo(
    () => makeStyles(COLORS),
    [COLORS]
  );

  const { product } =
    route.params;

  const [name, setName] =
    useState(
      product?.name || ''
    );

  const [saving, setSaving] =
    useState(false);

  const inFlight = useRef(false);
  
    const runGuarded = async (task) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setSaving(true);
      try {
        await task();
      } catch (e) {
        if (__DEV__) console.warn(e);
        toast.show("Couldn't save. Check internet and try again.", 'error');
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
          'Missing Field',
          'Enter product name'
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
        .neq('id', product.id)
        .limit(1);

      if (checkError) {
        setSaving(false);

        toast.show("Couldn't check existing products. Try again.", 'error');

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
          .update({
            name: trimmed,
          })
          .eq(
            'id',
            product.id
          );

      setSaving(false);

      if (error) {
        toast.show("Couldn't save. Check internet and try again.", 'error');

        return;
      }

      navigation.goBack();
      toast.show('Product updated');
    });

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <View style={styles.card}>
        <Text
          style={styles.heading}
        >
          Edit Product
        </Text>

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
            <ActivityIndicator color={COLORS.onPrimary} />
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

      padding: SPACING.lg,
    },

    disabled: {
      opacity: 0.6,
    },

    card: {
      backgroundColor:
        COLORS.white,

      borderRadius:
        RADIUS.lg,

      padding: SPACING.lg,

      ...SHADOW,
    },

    heading: {
      fontSize: 30,

      fontWeight: '800',

      marginBottom: 24,

      color: COLORS.text,
    },

    input: {
      backgroundColor:
        COLORS.inputBg,

      borderRadius:
        RADIUS.sm,

      padding: 16,

      marginBottom: 20,

      fontSize: 18,

      fontWeight: '600',

      color: COLORS.text,
    },

    button: {
      backgroundColor:
        COLORS.primary,

      padding: 18,

      borderRadius:
        RADIUS.md,

      alignItems: 'center',
    },

    buttonText: {
      color: COLORS.onPrimarySoft,

      fontWeight: '700',

      fontSize: 16,
    },
  });