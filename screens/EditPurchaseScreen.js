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

import DateTimePicker from '@react-native-community/datetimepicker';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import { supabase } from '../lib/supabase';

import { parsePrice } from '../utils/validation';

import {
  useTheme,
  SHADOW,
  SPACING,
  RADIUS,
} from '../theme';

export default function EditPurchaseScreen({
  route,
  navigation,
}) {
  const COLORS = useTheme();

  const styles = React.useMemo(
    () => makeStyles(COLORS),
    [COLORS]
  );

  const {
    purchase,
    isAdmin,
  } = route.params;

  const [
    purchaserName,
    setPurchaserName,
  ] = useState(
    purchase
      ?.purchaser_name ??
      ''
  );

  const [
    quantity,
    setQuantity,
  ] = useState(
    String(
      purchase?.quantity ??
        ''
    )
  );

  const [
    purchasePrice,
    setPurchasePrice,
  ] = useState(
    String(
      purchase?.purchase_price ??
        ''
    )
  );

  const [
    finalPrice,
    setFinalPrice,
  ] = useState(
    String(
      purchase?.final_price ??
        ''
    )
  );

  const [notes, setNotes] =
    useState(
      purchase?.notes ?? ''
    );

  const [date, setDate] =
    useState(() => {
      const parsed = new Date(
        purchase?.purchase_date
      );

      return Number.isNaN(
        parsed.getTime()
      )
        ? new Date()
        : parsed;
    });

  const [
    showPicker,
    setShowPicker,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  // SAVE
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
      if (!purchaserName.trim()) {
        Alert.alert('Missing Field', 'Please enter the purchaser name');
        return;
      }

      if (!quantity.trim()) {
        Alert.alert('Missing Field', 'Please enter the quantity');
        return;
      }

      const purchaseValue = parsePrice(purchasePrice);
      if (purchaseValue === null) {
        Alert.alert('Invalid Purchase Price', 'Enter the purchase price as a number, 0 or more');
        return;
      }

      const finalValue = parsePrice(finalPrice);
      if (finalValue === null) {
        Alert.alert('Invalid Final Price', 'Enter the final price (after transport) as a number, 0 or more');
        return;
      }

      setSaving(true);

      const { error } =
        await supabase
          .from('purchases')
          .update({
            purchaser_name: purchaserName.trim(),
            quantity: quantity.trim(),
            purchase_price: purchaseValue,
            final_price: finalValue,
            notes,
            purchase_date: date.toISOString(),
          })
          .eq('id', purchase.id);

      setSaving(false);

      if (error) {
        if (__DEV__) console.warn(error);

        Alert.alert('Error', 'Failed to update purchase');
        return;
      }

      Alert.alert('Success', 'Purchase Updated', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ], { cancelable: false });
    });

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

            onPress: () =>
              runGuarded(async () => {

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

                setSaving(false);

                if (error) {
                  Alert.alert(
                    'Error',
                    'Failed to delete purchase'
                  );

                  return;
                }

                Alert.alert(
                  'Deleted',
                  'Purchase deleted successfully',
                  [
                    {
                      text: 'OK',
                      onPress: () =>
                        navigation.goBack(),
                    },
                  ],
                  { cancelable: false }
                );
              }),
          },
        ]
      );
    };

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
            keyboardType="decimal-pad"
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
            keyboardType="decimal-pad"
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
              Platform.OS === 'ios' ? (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="spinner"
                    onValueChange={(event, selectedDate) => {
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
              ) : (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onValueChange={(event, selectedDate) => {
                    setShowPicker(false);
                    if (selectedDate) {
                      setDate(selectedDate);
                    }
                  }}
                  onDismiss={() => setShowPicker(false)}
                />
              )
            )}

          {/* SAVE */}
          <TouchableOpacity
            style={[
              styles.button,
              saving && styles.disabled,
            ]}
            onPress={
              handleSave
            }
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
              Save Purchase
            </Text>
            )}
          </TouchableOpacity>

          {/* DELETE */}
          {isAdmin && (
            <TouchableOpacity
              style={[
                styles.deleteButton,
                saving && styles.disabled,
              ]}
              onPress={
                handleDelete
              }
              disabled={saving}
            >
              <MaterialIcons
                name="delete"
                size={22}
                color={COLORS.onPrimarySoft}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },

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

    disabled: {
      opacity: 0.6,
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
      color: COLORS.onPrimarySoft,

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
          color: COLORS.onPrimary,
          fontWeight: '700',
          fontSize: 16,
      },
  });