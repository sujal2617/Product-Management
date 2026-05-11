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

import { COLORS } from './theme';

const Stack =
  createNativeStackNavigator();

export default function App() {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

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

  // LOADING
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent:
            'center',
          alignItems: 'center',
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
      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          COLORS.background
        }
      />

      <NavigationContainer>
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
              fontWeight: '700',
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
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}