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

import DateTimePicker from '@react-native-community/datetimepicker';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import { supabase } from '../lib/supabase';

import {
  COLORS,
  SHADOW,
  SPACING,
  RADIUS,
} from '../theme';

export default function AddPurchaseScreen({
  route,
  navigation,
}) {
  const { productId } =
    route.params;

  const [sellerName,
    setSellerName] =
    useState('');

  const [quantity,
    setQuantity] =
    useState('');

  const [purchasePrice,
    setPurchasePrice] =
    useState('');

  const [finalPrice,
    setFinalPrice] =
    useState('');

  const [notes, setNotes] =
    useState('');

  const [date, setDate] =
    useState(new Date());

  const [showPicker,
    setShowPicker] =
    useState(false);

  const handleSave =
    async () => {
      if (
        !sellerName ||
        !quantity ||
        !purchasePrice ||
        !finalPrice
      ) {
        Alert.alert(
          'Missing Fields',
          'Please fill all required fields'
        );

        return;
      }

      const { error } =
        await supabase
          .from('purchases')
          .insert({
            product_id:
              productId,

            purchaser_name:
              sellerName,

            quantity,

            purchase_price:
              parseFloat(
                purchasePrice
              ),

            final_price:
              parseFloat(
                finalPrice
              ),

            notes,

            purchase_date:
              date.toISOString(),
          });

      if (error) {
        console.log(error);

        Alert.alert(
          'Error',
          'Failed to save purchase'
        );

        return;
      }

      Alert.alert(
        'Success',
        'Purchase Added'
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
      >
        <Text
          style={styles.heading}
        >
          Add Purchase
        </Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Name of Purchaser"
            value={sellerName}
            onChangeText={
              setSellerName
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Quantity"
            value={quantity}
            onChangeText={
              setQuantity
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Purchase Price"
            value={purchasePrice}
            onChangeText={
              setPurchasePrice
            }
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Final Price"
            value={finalPrice}
            onChangeText={
              setFinalPrice
            }
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Notes"
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity
            style={
              styles.dateBox
            }
            onPress={() =>
              setShowPicker(
                true
              )
            }
          >
            <Text>
              {date.toLocaleDateString(
                'en-GB',
                {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }
              )}
            </Text>

            <MaterialIcons
              name="calendar-month"
              size={24}
              color={
                COLORS.primary
              }
            />
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={(
                e,
                selected
              ) => {
                setShowPicker(
                  false
                );

                if (selected) {
                  setDate(
                    selected
                  );
                }
              }}
            />
          )}

          <TouchableOpacity
            style={
              styles.button
            }
            onPress={handleSave}
          >
            <Text
              style={
                styles.buttonText
              }
            >
              Save Purchase
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

      padding: 16,

      marginBottom: 18,
    },

    dateBox: {
      backgroundColor:
        COLORS.inputBg,

      borderRadius:
        RADIUS.sm,

      padding: 16,

      marginBottom: 20,

      flexDirection: 'row',

      justifyContent:
        'space-between',
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
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
  });