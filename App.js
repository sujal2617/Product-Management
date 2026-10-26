import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';

import React, {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  View,
  StatusBar,
  Platform,
} from 'react-native';

import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import {
  onAuthStateChanged,
} from 'firebase/auth';

import { auth } from './lib/firebase';

import { supabase } from './lib/supabase';

import LoginScreen from './screens/LoginScreen';

import RegisterScreen from './screens/RegisterScreen';

import ProductsScreen from './screens/ProductsScreen';

import ProductDetailScreen from './screens/ProductDetailScreen';

import AddProductScreen from './screens/AddProductScreen';

import AddPurchaseScreen from './screens/AddPurchaseScreen';

import EditPurchaseScreen from './screens/EditPurchaseScreen';

import EditProductScreen from './screens/EditProductScreen';

import ProfileScreen from './screens/ProfileScreen';

import AdminScreen from './screens/AdminScreen';

import NotesScreen from './screens/NotesScreen';

import { useTheme, DARK_COLORS } from './theme';

import { ToastProvider } from './components/Toast';

const Stack =
  createNativeStackNavigator();

export default function App() {
  const COLORS = useTheme();

  const isDark = COLORS === DARK_COLORS;

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),

    colors: {
      ...(isDark
        ? DarkTheme.colors
        : DefaultTheme.colors),

      background: COLORS.background,

      card: COLORS.white,

      text: COLORS.text,

      border: COLORS.border,

      primary: COLORS.primary,
    },
  };

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [isAdmin, setIsAdmin] =
    useState(false);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (firebaseUser) => {
          setUser(firebaseUser);

          setLoading(false);
        }
      );

    return unsubscribe;
  }, []);

  // Fetch role once per login; any error means not admin (UI only, RLS enforces).
  useEffect(() => {
    let cancelled = false;

    setIsAdmin(false);

    if (!user) return undefined;

    supabase
      .from('users')
      .select('role')
      .eq('id', user.uid)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!cancelled) {
          setIsAdmin(
            !error &&
              data?.role === 'admin'
          );
        }
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // LOADING SCREEN
  if (loading) {
    return (
      <View
        style={{
          flex: 1,

          justifyContent:
            'center',

          alignItems:
            'center',

          backgroundColor:
            COLORS.background,
        }}
      >
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
      {/* STATUS BAR */}
      <StatusBar
        translucent={false}
        barStyle={
          isDark
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={
          COLORS.background
        }
      />

      {/* NAVIGATION */}
      <NavigationContainer
        theme={navTheme}
      >
        <Stack.Navigator
          screenOptions={{
            animation:
              Platform.OS ===
              'ios'
                ? 'default'
                : 'slide_from_right',

            headerStyle: {
              backgroundColor:
                COLORS.white,
            },

            headerShadowVisible:
              false,

            headerTintColor:
              COLORS.text,

            headerTitleStyle: {
              fontWeight: '800',

              fontSize: 18,
            },

            contentStyle: {
              backgroundColor:
                COLORS.background,
            },

            gestureEnabled: true,
          }}
        >
          {!user ? (
            <>
              {/* LOGIN */}
              <Stack.Screen
                name="Login"
                component={
                  LoginScreen
                }
                options={{
                  headerShown:
                    false,
                }}
              />

              {/* REGISTER */}
              <Stack.Screen
                name="Register"
                component={
                  RegisterScreen
                }
                options={{
                  title:
                    'Create Account',
                }}
              />
            </>
          ) : (
            <>
              {/* PRODUCTS */}
              <Stack.Screen
                name="Products"
                component={
                  ProductsScreen
                }
                options={{
                  headerShown:
                    false,
                }}
              />

              {/* PRODUCT DETAIL */}
              <Stack.Screen
                name="ProductDetail"
                component={
                  ProductDetailScreen
                }
                options={{
                  title:
                    'Product Details',
                }}
              />

              {/* ADD PRODUCT */}
              <Stack.Screen
                name="AddProduct"
                component={
                  AddProductScreen
                }
                options={{
                  title:
                    'Add Product',
                }}
              />

              {/* ADD PURCHASE */}
              <Stack.Screen
                name="AddPurchase"
                component={
                  AddPurchaseScreen
                }
                options={{
                  title:
                    'Add Purchase',
                }}
              />

              {/* EDIT PURCHASE */}
              <Stack.Screen
                name="EditPurchase"
                component={
                  EditPurchaseScreen
                }
                options={{
                  title:
                    'Edit Purchase',
                }}
              />

              {/* EDIT PRODUCT */}
              <Stack.Screen
                name="EditProduct"
                component={
                  EditProductScreen
                }
                options={{
                  title:
                    'Edit Product',
                }}
              />

                {/* NOTES */}
                <Stack.Screen
                    name="Notes"
                    component={NotesScreen}
                    options={{
                        title: 'Notes',
                    }}
                />

              {/* PROFILE */}
              <Stack.Screen
                name="Profile"
                component={
                  ProfileScreen
                }
                options={{
                  title:
                    'My Profile',
                }}
              />

              {/* ADMIN */}
              {isAdmin && (
                <Stack.Screen
                  name="Admin"
                  component={
                    AdminScreen
                  }
                  options={{
                    title:
                      'Admin Dashboard',
                  }}
                />
              )}
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      </ToastProvider>
    </SafeAreaProvider>
  );
}