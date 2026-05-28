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

  const [
    sellerName,
    setSellerName,
  ] = useState('');

  const [
    quantity,
    setQuantity,
  ] = useState('');

  const [
    purchasePrice,
    setPurchasePrice,
  ] = useState('');

  const [
    finalPrice,
    setFinalPrice,
  ] = useState('');

  const [notes, setNotes] =
    useState('');

  const [date, setDate] =
    useState(new Date());

  const [
    showPicker,
    setShowPicker,
  ] = useState(false);

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
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text
          style={styles.heading}
        >
          Add Purchase
        </Text>

        <View style={styles.card}>
          {/* PURCHASER */}
          <TextInput
            style={styles.input}
            placeholder="Name of Purchaser"
            placeholderTextColor={
              COLORS.subText
            }
            value={sellerName}
            onChangeText={
              setSellerName
            }
            selectionColor={
              COLORS.primary
            }
          />

          {/* QUANTITY */}
          <TextInput
            style={styles.input}
            placeholder="Quantity"
            placeholderTextColor={
              COLORS.subText
            }
            value={quantity}
            onChangeText={
              setQuantity
            }
            selectionColor={
              COLORS.primary
            }
          />

          {/* PURCHASE PRICE */}
          <TextInput
            style={styles.input}
            placeholder="Purchase Price"
            placeholderTextColor={
              COLORS.subText
            }
            value={purchasePrice}
            onChangeText={
              setPurchasePrice
            }
            keyboardType="numeric"
            selectionColor={
              COLORS.primary
            }
          />

          {/* FINAL PRICE */}
          <TextInput
            style={styles.input}
            placeholder="Final Price"
            placeholderTextColor={
              COLORS.subText
            }
            value={finalPrice}
            onChangeText={
              setFinalPrice
            }
            keyboardType="numeric"
            selectionColor={
              COLORS.primary
            }
          />

          {/* NOTES */}
          <TextInput
            style={styles.input}
            placeholder="Notes"
            placeholderTextColor={
              COLORS.subText
            }
            value={notes}
            onChangeText={setNotes}
            selectionColor={
              COLORS.primary
            }
          />

          {/* DATE */}
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
            <Text
              style={
                styles.dateText
              }
            >
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
                <View style={styles.pickerContainer}>
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="spinner"
                        onChange={(event, selectedDate) => {
                            if (selectedDate) {
                                setDate(selectedDate);
                            }
                        }}
                    />

                    <TouchableOpacity
                        style={styles.doneButton}
                        onPress={() => setShowPicker(false)}
                    >
                        <Text style={styles.doneText}>
                            Done
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

          {/* SAVE */}
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

      padding: 18,

      marginBottom: 18,

      fontSize: 16,

      fontWeight: '600',

      color: COLORS.text,
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

      alignItems: 'center',
    },

    dateText: {
      fontSize: 16,

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

      pickerContainer: {
          backgroundColor: COLORS.white,
          borderRadius: RADIUS.md,
          marginBottom: 20,
          padding: 10,
      },

      doneButton: {
          backgroundColor: COLORS.primary,
          paddingVertical: 12,
          borderRadius: 12,
          alignItems: 'center',
          marginTop: 8,
      },

      doneText: {
          color: '#fff',
          fontWeight: '700',
          fontSize: 16,
      },
  });