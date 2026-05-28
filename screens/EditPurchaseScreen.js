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

export default function EditPurchaseScreen({
  route,
  navigation,
}) {
  const {
    purchase,
    isAdmin,
  } = route.params;

  const [
    purchaserName,
    setPurchaserName,
  ] = useState(
    purchase
      ?.purchaser_name ||
      ''
  );

  const [
    quantity,
    setQuantity,
  ] = useState(
    purchase?.quantity ||
      ''
  );

  const [
    purchasePrice,
    setPurchasePrice,
  ] = useState(
    String(
      purchase?.purchase_price ||
        ''
    )
  );

  const [
    finalPrice,
    setFinalPrice,
  ] = useState(
    String(
      purchase?.final_price ||
        ''
    )
  );

  const [notes, setNotes] =
    useState(
      purchase?.notes || ''
    );

  const [date, setDate] =
    useState(
      new Date(
        purchase?.purchase_date
      )
    );

  const [
    showPicker,
    setShowPicker,
  ] = useState(false);

  // SAVE
  const handleSave =
    async () => {
      const { error } =
        await supabase
          .from('purchases')
          .update({
            purchaser_name:
              purchaserName,

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
          })
          .eq(
            'id',
            purchase.id
          );

      if (error) {
        console.log(error);

        Alert.alert(
          'Error',
          'Failed to update purchase'
        );

        return;
      }

      Alert.alert(
        'Success',
        'Purchase Updated'
      );

      navigation.goBack();
    };

  // DELETE
  const handleDelete =
    () => {
      Alert.alert(
        'Delete Purchase',
        'Are you sure you want to delete this purchase?',
        [
          {
            text: 'Cancel',
            style:
              'cancel',
          },

          {
            text: 'Delete',

            style:
              'destructive',

            onPress:
              async () => {
                const {
                  error,
                } =
                  await supabase
                    .from(
                      'purchases'
                    )
                    .delete()
                    .eq(
                      'id',
                      purchase.id
                    );

                if (error) {
                  Alert.alert(
                    'Error',
                    'Failed to delete purchase'
                  );

                  return;
                }

                Alert.alert(
                  'Deleted',
                  'Purchase deleted successfully'
                );

                navigation.goBack();
              },
          },
        ]
      );
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
          Edit Purchase
        </Text>

        <View style={styles.card}>
          {/* PURCHASER */}
          <TextInput
            style={styles.input}
            placeholder="Name of Purchaser"
            placeholderTextColor={
              COLORS.subText
            }
            value={
              purchaserName
            }
            onChangeText={
              setPurchaserName
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
            value={
              purchasePrice
            }
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
            onChangeText={
              setNotes
            }
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
            onPress={
              handleSave
            }
          >
            <Text
              style={
                styles.buttonText
              }
            >
              Save Purchase
            </Text>
          </TouchableOpacity>

          {/* DELETE */}
          {isAdmin && (
            <TouchableOpacity
              style={
                styles.deleteButton
              }
              onPress={
                handleDelete
              }
            >
              <MaterialIcons
                name="delete"
                size={22}
                color="#eef7ff"
              />

              <Text
                style={
                  styles.buttonText
                }
              >
                Delete Purchase
              </Text>
            </TouchableOpacity>
          )}
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

      paddingBottom: 60,
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

      fontSize: 17,

      fontWeight: '500',

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
      fontSize: 17,

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

      marginBottom: 16,
    },

    deleteButton: {
      backgroundColor:
        COLORS.danger,

      borderRadius:
        RADIUS.md,

      padding: 18,

      alignItems: 'center',

      flexDirection: 'row',

      justifyContent:
        'center',
    },

    buttonText: {
      color: '#eef7ff',

      fontWeight: '700',

      fontSize: 16,

      marginLeft: 8,
    },

      pickerContainer: {
          backgroundColor: COLORS.white,
          borderRadius: RADIUS.md,
          padding: 10,
          marginBottom: 20,
      },

      doneButton: {
          backgroundColor: COLORS.primary,
          borderRadius: 12,
          paddingVertical: 12,
          alignItems: 'center',
          marginTop: 8,
      },

      doneText: {
          color: '#fff',
          fontWeight: '700',
          fontSize: 16,
      },
  });