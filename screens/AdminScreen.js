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
  TextInput,
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

  const [search, setSearch] =
    useState('');

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const fetchProducts =
    async () => {
      const {
        data,
        error,
      } = await supabase
        .from('products')
        .select('*')
        .order('name', {
          ascending: true,
        });

      if (!error) {
        setProducts(
          data || []
        );
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

  // SEARCH FILTER
  const filteredProducts =
    search.trim() === ''
      ? products
      : products.filter(
          (item) =>
            item.name
              ?.toLowerCase()
              .includes(
                search
                  .trim()
                  .toLowerCase()
              )
        );

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <View style={styles.container}>
        {/* HEADING */}
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

        {/* SEARCH */}
        <View
          style={styles.searchBox}
        >
          <MaterialIcons
            name="search"
            size={22}
            color={
              COLORS.subText
            }
          />

          <TextInput
            style={
              styles.searchInput
            }
            placeholder="Search Products"
            placeholderTextColor={
              COLORS.subText
            }
            value={search}
            onChangeText={
              setSearch
            }
            autoCapitalize="none"
            autoCorrect={false}
          />

          {search.length >
            0 && (
            <TouchableOpacity
              onPress={() =>
                setSearch('')
              }
            >
              <MaterialIcons
                name="close"
                size={22}
                color={
                  COLORS.subText
                }
              />
            </TouchableOpacity>
          )}
        </View>

        {/* PRODUCTS */}
        <FlatList
          data={filteredProducts}
          keyExtractor={(
            item
          ) =>
            item.id.toString()
          }
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={{
            paddingBottom: 40,
          }}
          renderItem={({
            item,
          }) => (
            <View
              style={styles.card}
            >
              {/* LEFT */}
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
              </View>

              {/* ACTIONS */}
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
                    color={COLORS.white}
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
                    color={COLORS.white}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View
              style={
                styles.emptyBox
              }
            >
              <MaterialIcons
                name="inventory"
                size={70}
                color={
                  COLORS.subText
                }
              />

              <Text
                style={
                  styles.emptyText
                }
              >
                No Products Found
              </Text>
            </View>
          }
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
      marginBottom: 24,
    },

    // SEARCH
    searchBox: {
      flexDirection: 'row',

      alignItems: 'center',

      backgroundColor:
        COLORS.white,

      borderRadius:
        RADIUS.md,

      paddingHorizontal: 16,

      marginBottom: 22,

      height: 62,

      ...SHADOW,
    },

    searchInput: {
      flex: 1,

      marginLeft: 10,

      fontSize: 22,

      fontWeight: '600',

      color: COLORS.text,
    },

    // CARD
    card: {
      backgroundColor:
        COLORS.white,

      borderRadius:
        RADIUS.lg,

      minHeight: 82,

      paddingHorizontal: 18,

      marginBottom: 18,

      flexDirection: 'row',

      justifyContent:
        'space-between',

      alignItems: 'center',

      ...SHADOW,
    },

    leftContent: {
      flex: 1,

      justifyContent:
        'center',
    },

    name: {
      fontSize: 18,

      fontWeight: '700',

      color: COLORS.text,
    },

    actions: {
      flexDirection: 'row',

      alignItems: 'center',
    },

    editButton: {
      width: 50,

      height: 50,

      borderRadius: 15,

      backgroundColor:
        COLORS.primary,

      justifyContent:
        'center',

      alignItems: 'center',

      marginRight: 10,
    },

    deleteButton: {
      width: 50,

      height: 50,

      borderRadius: 15,

      backgroundColor:
        COLORS.danger,

      justifyContent:
        'center',

      alignItems: 'center',
    },

    emptyBox: {
      alignItems: 'center',
      marginTop: 80,
    },

    emptyText: {
      marginTop: 16,

      fontSize: 18,

      fontWeight: '600',

      color: COLORS.subText,
    },
  });