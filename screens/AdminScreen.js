import React, {
  useState,
  useCallback,
} from 'react';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useFocusEffect,
} from '@react-navigation/native';

import { supabase } from '../lib/supabase';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import {
  COLORS,
  SHADOW,
  SPACING,
  RADIUS,
} from '../theme';

export default function AdminScreen({
  navigation,
}) {
  const [products, setProducts] =
    useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const fetchProducts = async () => {
    const { data, error } =
      await supabase
        .from('products')
        .select('*')
        .order('name', {
          ascending: true,
        });

    if (!error) {
      setProducts(data || []);
    }
  };

  const handleDelete =
    async (id) => {
      Alert.alert(
        'Delete Product',
        'This will also delete all purchases',
        [
          {
            text: 'Cancel',
          },

          {
            text: 'Delete',

            style:
              'destructive',

            onPress:
              async () => {
                await supabase
                  .from(
                    'purchases'
                  )
                  .delete()
                  .eq(
                    'product_id',
                    id
                  );

                await supabase
                  .from(
                    'products'
                  )
                  .delete()
                  .eq(
                    'id',
                    id
                  );

                fetchProducts();
              },
          },
        ]
      );
    };

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <View style={styles.container}>
        <Text
          style={styles.heading}
        >
          Admin Panel
        </Text>

        <Text
          style={
            styles.subHeading
          }
        >
          Manage products &
          purchases
        </Text>

        <FlatList
          data={products}
          keyExtractor={(item) =>
            item.id.toString()
          }
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={{
            paddingBottom: 40,
          }}
          renderItem={({ item }) => (
            <View
              style={styles.card}
            >
              <View
                style={
                  styles.leftContent
                }
              >
                <Text
                  style={
                    styles.name
                  }
                >
                  {item.name}
                </Text>

                <Text
                  style={
                    styles.seller
                  }
                >
                  {
                    item.seller_name
                  }
                </Text>
              </View>

              <View
                style={
                  styles.actions
                }
              >
                <TouchableOpacity
                  style={
                    styles.editButton
                  }
                  onPress={() =>
                    navigation.navigate(
                      'EditProduct',
                      {
                        product:
                          item,
                      }
                    )
                  }
                >
                  <MaterialIcons
                    name="edit"
                    size={22}
                    color="#fff"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.deleteButton
                  }
                  onPress={() =>
                    handleDelete(
                      item.id
                    )
                  }
                >
                  <MaterialIcons
                    name="delete"
                    size={22}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
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
    },

    container: {
      flex: 1,
      padding: SPACING.lg,
    },

    heading: {
      fontSize: 34,
      fontWeight: '800',
      color: COLORS.text,
      marginTop: 10,
    },

    subHeading: {
      marginTop: 8,
      color: COLORS.subText,
      fontSize: 16,
      marginBottom: 28,
    },

    card: {
      backgroundColor:
        COLORS.white,

      borderRadius:
        RADIUS.lg,

      padding: SPACING.lg,

      marginBottom: 18,

      flexDirection: 'row',

      justifyContent:
        'space-between',

      alignItems: 'center',

      ...SHADOW,
    },

    leftContent: {
      flex: 1,
      marginRight: 10,
    },

    name: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.text,
    },

    seller: {
      marginTop: 6,
      color: COLORS.subText,
      fontSize: 15,
    },

    actions: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    editButton: {
      width: 46,
      height: 46,
      borderRadius: 14,

      backgroundColor:
        COLORS.primary,

      justifyContent:
        'center',

      alignItems: 'center',

      marginRight: 10,
    },

    deleteButton: {
      width: 46,
      height: 46,
      borderRadius: 14,

      backgroundColor:
        COLORS.danger,

      justifyContent:
        'center',

      alignItems: 'center',
    },
  });