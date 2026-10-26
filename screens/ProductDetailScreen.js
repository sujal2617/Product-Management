import React, {
  useState,
  useCallback,
  useRef,
} from 'react';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
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
  const routeProduct =
    route?.params?.product;

  const productId = routeProduct?.id;

  const [product, setProduct] =
    useState(routeProduct);

  const [purchases,
    setPurchases] =
    useState([]);

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [roleError, setRoleError] =
    useState(false);

  const requestId = useRef(0);

  const fetchData = useCallback(
    async () => {
      const id = ++requestId.current;
      const firebaseUser =
        auth.currentUser;

      const [
        productRes,
        purchasesRes,
        roleRes,
      ] = await Promise.all([
        supabase
          .from('products')
          .select('id,name')
          .eq('id', productId)
          .maybeSingle(),

        supabase
          .from('purchases')
          .select('*')
          .eq('product_id', productId)
          .order('purchase_date', {
            ascending: false,
          }),

        firebaseUser
          ? supabase
              .from('users')
              .select('role')
              .eq('id', firebaseUser.uid)
              .maybeSingle()
          : Promise.resolve({
              data: null,
              error: null,
            }),
      ]);

      if (id !== requestId.current) {
        return;
      }

      setLoading(false);
      setRefreshing(false);

      // role failure: stay view-only, but tell the user
      setRoleError(!!roleRes.error);
      setIsAdmin(
        !roleRes.error &&
          roleRes.data?.role === 'admin'
      );

      const failure =
        productRes.error ||
        purchasesRes.error;

      if (failure) {
        setError(
          failure.message ||
            'Could not load product'
        );
        return;
      }

      setError(null);
      setProduct(productRes.data);
      setPurchases(
        purchasesRes.data || []
      );
    },
    [productId]
  );

  useFocusEffect(
    useCallback(() => {
      if (productId) {
        fetchData();
      }
    }, [productId, fetchData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchData();
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

  const renderHeader = () => (
    <View>
      {/* PRODUCT CARD */}
      <View
        style={styles.productCard}
      >
        <Text
          style={styles.productName}
        >
          {product.name}
        </Text>

        <Text
          style={styles.roleText}
        >
          {isAdmin
            ? 'Admin Access'
            : 'View Only'}
        </Text>

        {roleError && (
          <Text
            style={styles.warningText}
          >
            Could not check your
            access. Showing view only.
          </Text>
        )}
      </View>

      {/* TITLE */}
      <Text
        style={styles.sectionTitle}
      >
        Purchases
      </Text>
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyBox}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyBox}>
          <MaterialIcons
            name="error-outline"
            size={70}
            color={COLORS.danger}
          />

          <Text
            style={styles.emptyText}
          >
            Could not load purchases
          </Text>

          <Text
            style={styles.errorDetail}
          >
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Text
              style={styles.retryText}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyBox}>
        <MaterialIcons
          name="inventory"
          size={70}
          color={COLORS.subText}
        />

        <Text style={styles.emptyText}>
          No Purchases Yet
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <FlatList
        data={purchases}
        keyExtractor={(item) =>
          item.id.toString()
        }
        contentContainerStyle={[
          styles.container,
          { paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListHeaderComponent={
          renderHeader()
        }
        ListEmptyComponent={
          renderEmpty()
        }
        renderItem={({ item }) => (
          <PurchaseCard
            item={item}
            isAdmin={isAdmin}
            onEdit={() =>
              navigation.navigate(
                'EditPurchase',
                {
                  purchase: item,
                  isAdmin: isAdmin,
                }
              )
            }
          />
        )}
      />

      {/* ADD PURCHASE */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate(
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
          color={COLORS.white}
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

    warningText: {
      marginTop: 8,
      color: COLORS.danger,
      fontSize: 13,
      fontWeight: '600',
    },

    errorDetail: {
      marginTop: 8,
      fontSize: 14,
      color: COLORS.subText,
      textAlign: 'center',
    },

    retryButton: {
      marginTop: 20,
      backgroundColor: COLORS.primary,
      borderRadius: RADIUS.md,
      paddingHorizontal: 28,
      paddingVertical: 12,
    },

    retryText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: '700',
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