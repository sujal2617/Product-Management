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
  ScrollView,
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

export default function AddProductScreen({
  navigation,
}) {
  const [name, setName] =
    useState('');

  const handleSave =
    async () => {
      if (!name) {
        Alert.alert(
          'Missing Fields',
          'Please enter product name'
        );

        return;
      }

      const {
        data: existing,
      } = await supabase
        .from('products')
        .select('*')
        .ilike(
          'name',
          name.trim()
        )
        .maybeSingle();

      if (existing) {
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
            name:
              name.trim(),
          });

      if (error) {
        Alert.alert(
          'Error',
          'Failed to add product'
        );

        return;
      }

      Alert.alert(
        'Success',
        'Product Added'
      );

      navigation.goBack();
    };

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <ScrollView
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
      </ScrollView>
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