import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
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

import ProductCard from '../components/ProductCard';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import {
  useTheme,
  SPACING,
  SHADOW,
  RADIUS,
} from '../theme';

const PAGE_SIZE = 50;
const SEARCH_DELAY_MS = 300;

// escape LIKE wildcards so user text is matched literally
const escapeLike = (text) =>
  text.replace(/[\\%_]/g, '\\$&');

export default function ProductsScreen({
  navigation,
}) {
  const COLORS = useTheme();

  const styles = React.useMemo(
    () => makeStyles(COLORS),
    [COLORS]
  );

  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState('');

  const [query, setQuery] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [hasMore, setHasMore] =
    useState(false);

  const [error, setError] =
    useState(null);

  const requestId = useRef(0);
  const failedOffset = useRef(0);

  // debounce typing into the server query
  useEffect(() => {
    const timer = setTimeout(() => {
      const term = search.trim();

      if (term !== query) {
        setProducts([]);
        setHasMore(false);
        setError(null);
        setLoading(true);
        setQuery(term);
      }
    }, SEARCH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [search, query]);

  const fetchProducts = useCallback(
    async (term, offset) => {
      const id = ++requestId.current;

      if (offset > 0) {
        setLoadingMore(true);
      }

      let request = supabase
        .from('products')
        .select('id,name')
        .order('name', {
          ascending: true,
        })
        .order('id', {
          ascending: true,
        })
        .range(
          offset,
          offset + PAGE_SIZE - 1
        );

      if (term) {
        request = request.ilike(
          'name',
          escapeLike(term) + '%'
        );
      }

      const { data, error: fetchError } =
        await request;

      // a newer request replaced this one
      if (id !== requestId.current) {
        return;
      }

      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);

      if (fetchError) {
        failedOffset.current = offset;
        setError(
          fetchError.message ||
            'Could not load products'
        );
        return;
      }

      const rows = data || [];

      setError(null);
      setHasMore(
        rows.length === PAGE_SIZE
      );
      setProducts((prev) =>
        offset > 0
          ? [...prev, ...rows]
          : rows
      );
    },
    []
  );

  // load on focus and when the search term changes
  useFocusEffect(
    useCallback(() => {
      fetchProducts(query, 0);
    }, [query, fetchProducts])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts(query, 0);
  };

  const handleRetry = () => {
    setError(null);
    if (failedOffset.current > 0) {
      fetchProducts(query, failedOffset.current);
      return;
    }
    setLoading(true);
    fetchProducts(query, 0);
  };

  const handleEndReached = () => {
    if (
      loading ||
      refreshing ||
      loadingMore ||
      !hasMore ||
      error
    ) {
      return;
    }

    fetchProducts(
      query,
      products.length
    );
  };

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
            size={64}
            color={COLORS.danger}
          />

          <Text style={styles.emptyText}>
            Could not load products
          </Text>

          <Text style={styles.errorDetail}>
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
          name="inventory-2"
          size={64}
          color={COLORS.subText}
        />

        <Text style={styles.emptyText}>
          No Products Found
        </Text>
      </View>
    );
  };

  // error while a list is already on screen
  const renderHeader = () =>
    error && products.length > 0 ? (
      <TouchableOpacity
        style={styles.errorBanner}
        onPress={handleRetry}
      >
        <Text style={styles.errorBannerText}>
          Could not load products. Tap to retry.
        </Text>
      </TouchableOpacity>
    ) : null;

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
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            style={
              styles.profileButton
            }
            onPress={() =>
              navigation.navigate(
                'Profile'
              )
            }
          >
            <MaterialIcons
              name="person"
              size={24}
              color={COLORS.onPrimary}
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
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
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
          data={products}
          keyExtractor={(item) =>
            item.id.toString()
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 120,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => {
                navigation.navigate(
                  'ProductDetail',
                  {
                    product: item,
                  }
                );
              }}
            />
          )}
          ListHeaderComponent={
            renderHeader()
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                style={styles.footerSpinner}
                color={COLORS.primary}
              />
            ) : null
          }
          ListEmptyComponent={
            renderEmpty()
          }
        />

        {/* ADD PRODUCT */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Add product"
          style={styles.fab}
          onPress={() =>
            navigation.navigate(
              'AddProduct'
            )
          }
        >
          <MaterialIcons
            name="add"
            size={34}
            color={COLORS.onPrimary}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS) =>
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

      fontSize: 22,

      fontWeight: '600',

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
      color: COLORS.onPrimary,
      fontSize: 16,
      fontWeight: '700',
    },

    errorBanner: {
      backgroundColor: COLORS.white,
      borderRadius: RADIUS.md,
      padding: 14,
      marginBottom: 16,
      ...SHADOW,
    },

    errorBannerText: {
      color: COLORS.danger,
      fontWeight: '600',
    },

    footerSpinner: {
      marginVertical: 20,
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

      shadowColor: COLORS.text,

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity: 0.2,

      shadowRadius: 10,

      elevation: 6,
    },
  });