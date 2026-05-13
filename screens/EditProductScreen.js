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
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import { supabase } from '../lib/supabase';

import {
  COLORS,
  SHADOW,
  SPACING,
  RADIUS,
} from '../theme';

export default function EditProductScreen({
  route,
  navigation,
}) {
  const { product } =
    route.params;

  const [name, setName] =
    useState(
      product?.name || ''
    );

  const handleSave =
    async () => {
      if (!name.trim()) {
        Alert.alert(
          'Missing Field',
          'Enter product name'
        );

        return;
      }

      const { error } =
        await supabase
          .from('products')
          .update({
            name:
              name.trim(),
          })
          .eq(
            'id',
            product.id
          );

      if (error) {
        Alert.alert(
          'Error',
          'Failed to update product'
        );

        return;
      }

      Alert.alert(
        'Success',
        'Product Updated'
      );

      navigation.goBack();
    };

  return (
    <SafeAreaView
      style={styles.safe}
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
          style={styles.button}
          onPress={handleSave}
        >
          <Text
            style={
              styles.buttonText
            }
          >
            Save Product
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,

      backgroundColor:
        COLORS.background,

      padding: SPACING.lg,
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
      color: '#eef7ff',

      fontWeight: '700',

      fontSize: 16,
    },
  });