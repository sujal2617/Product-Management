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
  TextInput,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useFocusEffect,
} from '@react-navigation/native';

import { supabase } from '../lib/supabase';

import ProductCard from '../components/ProductCard';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import {
  COLORS,
  SPACING,
  SHADOW,
  RADIUS,
} from '../theme';

export default function ProductsScreen({
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

  // PARTIAL SEARCH FILTER
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
        {/* HEADER */}
        <View style={styles.topBar}>
          <View>
            <Text
              style={styles.title}
            >
              Products
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Manage inventory
            </Text>
          </View>

          {/* PROFILE */}
          <TouchableOpacity
            style={
              styles.profileButton
            }
            onPress={() =>
              navigation.push(
                'Profile'
              )
            }
          >
            <MaterialIcons
              name="person"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

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

          {/* CLEAR BUTTON */}
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
            paddingBottom: 120,
          }}
          renderItem={({
            item,
          }) => (
            <ProductCard
              product={item}
              onPress={() => {
                navigation.push(
                  'ProductDetail',
                  {
                    product:
                      item,
                  }
                );
              }}
            />
          )}
          ListEmptyComponent={
            <View
              style={
                styles.emptyBox
              }
            >
              <MaterialIcons
                name="inventory-2"
                size={64}
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

        {/* ADD PRODUCT */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            navigation.push(
              'AddProduct'
            )
          }
        >
          <MaterialIcons
            name="add"
            size={34}
            color="#fff"
          />
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
    },

    container: {
      flex: 1,
      paddingHorizontal:
        SPACING.lg,

      paddingTop:
        SPACING.md,
    },

    topBar: {
      flexDirection: 'row',

      justifyContent:
        'space-between',

      alignItems: 'center',

      marginBottom: 24,
    },

    title: {
      fontSize: 34,
      fontWeight: '800',
      color: COLORS.text,
    },

    subtitle: {
      marginTop: 6,
      color: COLORS.subText,
      fontSize: 15,
    },

    profileButton: {
      width: 52,

      height: 52,

      borderRadius: 26,

      backgroundColor:
        COLORS.primary,

      justifyContent:
        'center',

      alignItems: 'center',
    },

    searchBox: {
      flexDirection: 'row',

      alignItems: 'center',

      backgroundColor:
        COLORS.white,

      borderRadius:
        RADIUS.md,

      paddingHorizontal: 16,

      marginBottom: 20,

      height: 58,

      ...SHADOW,
    },

    searchInput: {
      flex: 1,

      marginLeft: 10,

      fontSize: 16,

      color: COLORS.text,
    },

    emptyBox: {
      alignItems: 'center',
      marginTop: 80,
    },

    emptyText: {
      marginTop: 16,
      fontSize: 18,
      color: COLORS.subText,
      fontWeight: '600',
    },

    fab: {
      position: 'absolute',

      bottom: 25,

      right: 25,

      width: 68,

      height: 68,

      borderRadius: 34,

      backgroundColor:
        COLORS.primary,

      justifyContent:
        'center',

      alignItems: 'center',

      shadowColor: '#000',

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity: 0.2,

      shadowRadius: 10,

      elevation: 6,
    },
  });