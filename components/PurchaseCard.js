import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import {
  COLORS,
  SHADOW,
  RADIUS,
} from '../theme';

export default function PurchaseCard({
  item,
  isAdmin,
  onEdit,
}) {
  // FORMAT DATE
  const formattedDate =
    new Date(
      item.purchase_date
    ).toLocaleDateString(
      'en-GB',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    );

  return (
    <View style={styles.card}>
      {/* DATE */}
      <View style={styles.dateRow}>
        <MaterialIcons
          name="calendar-month"
          size={17}
          color="#2d8cff"
        />

        <Text style={styles.date}>
          {formattedDate}
        </Text>
      </View>

      {/* PURCHASER + QUANTITY */}
      <View style={styles.row}>
        <Text style={styles.text}>
          {item.purchaser_name ||
            'N/A'}
        </Text>

        <Text style={styles.text}>
          Qty: {item.quantity}
        </Text>
      </View>

      {/* PRICES */}
      <View style={styles.row}>
        <Text style={styles.price}>
          ₹
          {
            item.purchase_price
          }
        </Text>

        <Text
          style={
            styles.finalPrice
          }
        >
          ₹
          {item.final_price}
        </Text>
      </View>

      {/* NOTES */}
      <Text style={styles.note}>
        Note:{' '}
        {item.notes ||
          'No notes'}
      </Text>

      {/* EDIT */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.editBtn}
          onPress={onEdit}
        >
          <MaterialIcons
            name="edit"
            size={17}
            color="#fff"
          />

          <Text
            style={
              styles.editText
            }
          >
            Edit
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        '#cbf5dd',

      borderRadius:
        RADIUS.md,

      padding: 14,

      marginBottom: 14,

      ...SHADOW,
    },

    dateRow: {
      flexDirection: 'row',

      alignItems: 'center',

      marginBottom: 10,
    },

    date: {
      marginLeft: 6,

      fontSize: 14,

      fontWeight: '700',

      color: COLORS.text,
    },

    row: {
      flexDirection: 'row',

      justifyContent:
        'space-between',

      marginBottom: 8,
    },

    text: {
      fontSize: 15,

      color: COLORS.text,

      fontWeight: '600',
    },

    price: {
      fontSize: 15,

      fontWeight: '800',

      color: '#2d8cff',

      lineHeight: 22,

      includeFontPadding: false,
    },

    finalPrice: {
      fontSize: 15,

      fontWeight: '800',

      color: '#ff3b3b',

      lineHeight: 22,

      includeFontPadding: false,
    },

    note: {
      marginTop: 2,

      fontSize: 14,

      color: COLORS.text,

      lineHeight: 20,
    },

    editBtn: {
      marginTop: 14,

      backgroundColor:
        '#2d8cff',

      borderRadius: 12,

      paddingVertical: 10,

      flexDirection: 'row',

      justifyContent:
        'center',

      alignItems: 'center',
    },

    editText: {
      color: '#fff',

      fontWeight: '700',

      marginLeft: 6,

      fontSize: 14,
    },
  });