import React, {
  useState,
  useCallback,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  signOut,
} from 'firebase/auth';

import { auth } from '../lib/firebase';

import { supabase } from '../lib/supabase';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import {
  COLORS,
  SHADOW,
  RADIUS,
  SPACING,
} from '../theme';

export default function ProfileScreen({
  navigation,
}) {
  const [userData, setUserData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [])
  );

  const fetchUser =
    async () => {
      try {
        const firebaseUser =
          auth.currentUser;

        if (!firebaseUser) {
          setLoading(false);
          return;
        }

        const {
          data,
          error,
        } = await supabase
          .from('users')
          .select('*')
          .eq(
            'id',
            firebaseUser.uid
          )
          .single();

        if (error) {
          console.log(error);

          Alert.alert(
            'Error',
            'Failed to load profile'
          );

          setLoading(false);

          return;
        }

        setUserData(data);

        setLoading(false);
      } catch (error) {
        console.log(error);

        setLoading(false);
      }
    };

  const handleLogout =
    async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.log(error);

        Alert.alert(
          'Error',
          'Logout failed'
        );
      }
    };

  // LOADING
  if (loading) {
    return (
      <SafeAreaView
        style={styles.safe}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Loading Profile...
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
        contentContainerStyle={
          styles.scroll
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View
            style={styles.avatar}
          >
            <MaterialIcons
              name="person"
              size={56}
              color={
                COLORS.white
              }
            />
          </View>

          <Text style={styles.name}>
            {userData?.name ||
              'User'}
          </Text>

          <Text
            style={styles.email}
          >
            {userData?.email}
          </Text>
        </View>

        {/* USER CARD */}
        <View style={styles.card}>
          {/* PHONE */}
          <View style={styles.row}>
            <View
              style={styles.iconBox}
            >
              <MaterialIcons
                name="phone"
                size={20}
                color={
                  COLORS.white
                }
              />
            </View>

            <View
              style={
                styles.infoBox
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                Mobile Number
              </Text>

              <Text
                style={
                  styles.info
                }
              >
                {userData?.phone ||
                  'Not Available'}
              </Text>
            </View>
          </View>

          {/* EMAIL */}
          <View style={styles.row}>
            <View
              style={styles.iconBox}
            >
              <MaterialIcons
                name="email"
                size={20}
                color={
                  COLORS.white
                }
              />
            </View>

            <View
              style={
                styles.infoBox
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                Email Address
              </Text>

              <Text
                style={
                  styles.info
                }
              >
                {userData?.email}
              </Text>
            </View>
          </View>

          {/* ROLE */}
          <View
            style={[
              styles.row,
              {
                marginBottom: 0,
              },
            ]}
          >
            <View
              style={styles.iconBox}
            >
              <MaterialIcons
                name="admin-panel-settings"
                size={20}
                color={
                  COLORS.white
                }
              />
            </View>

            <View
              style={
                styles.infoBox
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                Account Role
              </Text>

              <Text
                style={
                  styles.info
                }
              >
                {userData?.role}
              </Text>
            </View>
          </View>
        </View>

        {/* ADMIN BUTTON */}
        {userData?.role ===
          'admin' && (
          <TouchableOpacity
            style={
              styles.adminButton
            }
            onPress={() =>
              navigation.push(
                'Admin'
              )
            }
          >
            <MaterialIcons
              name="admin-panel-settings"
              size={24}
              color={
                COLORS.white
              }
            />

            <Text
              style={
                styles.buttonText
              }
            >
              Open Admin Dashboard
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
                navigation.navigate('Notes')
            }
        >
          <MaterialIcons
              name="note-alt"
              size={22}
              color="#fff"
          />

          <Text style={styles.actionText}>
            Notes
          </Text>
        </TouchableOpacity>

        {/* LOGOUT */}
        <TouchableOpacity
          style={
            styles.logoutButton
          }
          onPress={handleLogout}
        >
          <MaterialIcons
            name="logout"
            size={24}
            color={
              COLORS.white
            }
          />

          <Text
            style={
              styles.buttonText
            }
          >
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
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

    loadingContainer: {
      flex: 1,

      justifyContent:
        'center',

      alignItems: 'center',
    },

    loadingText: {
      marginTop: 16,

      fontSize: 18,

      color: COLORS.subText,

      fontWeight: '600',
    },

    scroll: {
      padding: SPACING.lg,

      paddingBottom: 50,
    },

    header: {
      alignItems: 'center',

      marginTop: 20,

      marginBottom: 30,
    },

    avatar: {
      width: 120,

      height: 120,

      borderRadius: 60,

      backgroundColor:
        COLORS.primary,

      justifyContent:
        'center',

      alignItems: 'center',

      marginBottom: 18,

      ...SHADOW,
    },

    name: {
      fontSize: 30,

      fontWeight: '800',

      color: COLORS.text,

      textAlign: 'center',
    },

    email: {
      marginTop: 8,

      color: COLORS.subText,

      fontSize: 15,

      textAlign: 'center',
    },

    card: {
      backgroundColor:
        COLORS.white,

      borderRadius:
        RADIUS.lg,

      padding: SPACING.lg,

      ...SHADOW,
    },

    row: {
      flexDirection: 'row',

      alignItems: 'center',

      marginBottom: 24,
    },

    iconBox: {
      width: 46,

      height: 46,

      borderRadius: 14,

      backgroundColor:
        COLORS.primary,

      justifyContent:
        'center',

      alignItems: 'center',

      marginRight: 14,
    },

    infoBox: {
      flex: 1,
    },

    label: {
      color: COLORS.subText,

      fontSize: 13,

      marginBottom: 4,
    },

    info: {
      color: COLORS.text,

      fontSize: 16,

      fontWeight: '700',
    },

    adminButton: {
      backgroundColor:
        COLORS.primary,

      borderRadius:
        RADIUS.md,

      padding: 18,

      marginTop: 28,

      flexDirection: 'row',

      justifyContent:
        'center',

      alignItems: 'center',

      ...SHADOW,
    },

    logoutButton: {
      backgroundColor:
        COLORS.danger,

      borderRadius:
        RADIUS.md,

      padding: 18,

      marginTop: 16,

      flexDirection: 'row',

      justifyContent:
        'center',

      alignItems: 'center',

      ...SHADOW,
    },

    actionButton: {
      backgroundColor: '#5B8DEF',
      borderRadius: RADIUS.md,
      padding: 18,
      marginTop: 16,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOW,
    },

    actionText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
      marginLeft: 10,
    },

    buttonText: {
      color: COLORS.white,

      fontWeight: '700',

      fontSize: 16,

      marginLeft: 10,
    },
  });