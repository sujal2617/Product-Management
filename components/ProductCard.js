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
  SPACING,
} from '../theme';

export default function ProductCard({
  product,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* LEFT */}
      <View
        style={
          styles.leftSection
        }
      >
        <View
          style={
            styles.iconBox
          }
        >
          <MaterialIcons
            name="inventory-2"
            size={28}
            color={COLORS.white}
          />
        </View>

        <View
          style={
            styles.textSection
          }
        >
          <Text
            style={
              styles.name
            }
            numberOfLines={1}
          >
            {product.name}
          </Text>
        </View>
      </View>

      {/* RIGHT */}
      <MaterialIcons
        name="chevron-right"
        size={28}
        color={
          COLORS.subText
        }
      />
    </TouchableOpacity>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        COLORS.white,

      borderRadius:
        RADIUS.lg,

      paddingVertical: 18,

      paddingHorizontal: 18,

      marginBottom: 16,

      flexDirection: 'row',

      justifyContent:
        'space-between',

      alignItems: 'center',

      minHeight: 88,

      ...SHADOW,
    },

    leftSection: {
      flexDirection: 'row',

      alignItems: 'center',

      flex: 1,
    },

    iconBox: {
      width: 56,

      height: 56,

      borderRadius: 18,

      backgroundColor:
        COLORS.primary,

      justifyContent:
        'center',

      alignItems: 'center',

      marginRight: 16,
    },

    textSection: {
      justifyContent:
        'center',

      flex: 1,
    },

    name: {
      fontSize: 18,

      fontWeight: '700',

      color: COLORS.text,
    },
  });