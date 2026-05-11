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
  ScrollView,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useFocusEffect,
} from '@react-navigation/native';

import { supabase } from '../lib/supabase';

import { auth } from '../lib/firebase';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import PurchaseCard from '../components/PurchaseCard';

import {
  COLORS,
  SHADOW,
  SPACING,
  RADIUS,
} from '../theme';

export default function ProductDetailScreen({
  route,
  navigation,
}) {
  const product =
    route?.params?.product;

  const [purchases,
    setPurchases] =
    useState([]);

  const [isAdmin, setIsAdmin] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      if (product?.id) {
        fetchData();
      }
    }, [product])
  );

  const fetchData =
    async () => {
      const firebaseUser =
        auth.currentUser;

      if (firebaseUser) {
        const { data: userData } =
          await supabase
            .from('users')
            .select('role')
            .eq(
              'id',
              firebaseUser.uid
            )
            .single();

        if (
          userData?.role ===
          'admin'
        ) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }

      const {
        data,
        error,
      } = await supabase
        .from('purchases')
        .select('*')
        .eq(
          'product_id',
          product.id
        )
        .order(
          'purchase_date',
          {
            ascending: false,
          }
        );

      if (!error) {
        setPurchases(
          data || []
        );
      }
    };

  // SAFETY
  if (!product) {
    return (
      <SafeAreaView
        style={styles.safe}
      >
        <View
          style={
            styles.errorContainer
          }
        >
          <Text
            style={
              styles.errorText
            }
          >
            Product not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={
            styles.container
          }
        >
          {/* PRODUCT CARD */}
          <View
            style={
              styles.productCard
            }
          >
            <Text
              style={
                styles.productName
              }
            >
              {product.name}
            </Text>

            <Text
              style={
                styles.roleText
              }
            >
              {isAdmin
                ? 'Admin Access'
                : 'View Only'}
            </Text>
          </View>

          {/* TITLE */}
          <Text
            style={
              styles.sectionTitle
            }
          >
            Purchases
          </Text>

          {/* EMPTY */}
          {purchases.length ===
          0 ? (
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
                No Purchases Yet
              </Text>
            </View>
          ) : (
            <FlatList
              data={purchases}
              keyExtractor={(
                item
              ) =>
                item.id.toString()
              }
              scrollEnabled={
                false
              }
              renderItem={({
                item,
              }) => (
                <PurchaseCard
                  item={item}
                  isAdmin={
                    isAdmin
                  }
                  onEdit={() =>
                    navigation.push(
                      'EditPurchase',
                      {
                        purchase:
                          item,

                        isAdmin:
                          isAdmin,
                      }
                    )
                  }
                />
              )}
            />
          )}
        </View>
      </ScrollView>

      {/* ADD PURCHASE */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.push(
            'AddPurchase',
            {
              productId:
                product.id,
            }
          )
        }
      >
        <MaterialIcons
          name="add"
          size={34}
          color="#fff"
        />
      </TouchableOpacity>
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
      padding:
        SPACING.lg,
    },

    errorContainer: {
      flex: 1,
      justifyContent:
        'center',
      alignItems: 'center',
    },

    errorText: {
      fontSize: 20,
      color: COLORS.text,
      fontWeight: '700',
    },

    productCard: {
      backgroundColor:
        COLORS.white,

      borderRadius:
        RADIUS.lg,

      padding:
        SPACING.lg,

      marginBottom: 28,

      ...SHADOW,
    },

    productName: {
      fontSize: 30,
      fontWeight: '800',
      color: COLORS.text,
    },

    roleText: {
      marginTop: 10,
      color: COLORS.primary,
      fontWeight: '700',
      fontSize: 15,
    },

    sectionTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: COLORS.text,
      marginBottom: 18,
    },

    emptyBox: {
      alignItems: 'center',
      marginTop: 60,
    },

    emptyText: {
      marginTop: 16,
      fontSize: 18,
      fontWeight: '600',
      color: COLORS.subText,
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

      ...SHADOW,
    },
  });