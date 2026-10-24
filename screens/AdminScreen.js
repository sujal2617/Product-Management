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
  Alert,
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

import {
  MaterialIcons,
} from '@expo/vector-icons';

import {
  COLORS,
  SHADOW,
  SPACING,
  RADIUS,
} from '../theme';

const PAGE_SIZE = 50;
const SEARCH_DELAY_MS = 300;

// escape LIKE wildcards so user text is matched literally
const escapeLike = (text) =>
  text.replace(/[\\%_]/g, '\\$&');

export default function AdminScreen({
  navigation,
}) {
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

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Product',
      'This will also delete all purchases',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const {
              error: purchasesError,
            } = await supabase
              .from('purchases')
              .delete()
              .eq('product_id', id);

            if (purchasesError) {
              Alert.alert(
                'Delete failed',
                'Could not delete purchases: ' +
                  purchasesError.message
              );
              return;
            }

            const {
              error: productError,
            } = await supabase
              .from('products')
              .delete()
              .eq('id', id);

            if (productError) {
              Alert.alert(
                'Delete failed',
                'Purchases were deleted but the product was not: ' +
                  productError.message
              );
              return;
            }

            fetchProducts(query, 0);
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
          data={products}
          keyExtractor={(item) =>
            item.id.toString()
          }
          keyboardShouldPersistTaps="handled"
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
            renderEmpty()
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

      notesButton: {
          backgroundColor: COLORS.primary,
          height: 54,
          borderRadius: RADIUS.md,
          marginBottom: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          ...SHADOW,
      },

      notesButtonText: {
          color: '#fff',
          fontSize: 16,
          fontWeight: '700',
          marginLeft: 8,
      },
  });