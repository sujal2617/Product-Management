import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Animated, Text, StyleSheet } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, DARK_COLORS, SPACING, RADIUS, SHADOW } from '../theme';

const TOAST_MS = 2500;

const ICONS = {
  success: 'check-circle',
  error: 'error-outline',
  info: 'info-outline',
};

const ToastContext = createContext({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const COLORS = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);
  const idRef = useRef(0);

  const show = useCallback(
    (message, type = 'success') => {
      if (!message) return;
      clearTimeout(timer.current);
      idRef.current += 1;
      setToast({ message, type, id: idRef.current });
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) setToast(null);
        });
      }, TOAST_MS);
    },
    [opacity]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(() => ({ show }), [show]);

  const bg =
    toast?.type === 'error'
      ? COLORS.dangerStrong
      : toast?.type === 'info'
      ? COLORS.info
      : COLORS.success;

  // dark palette uses light accents, so use dark text there
  const fg =
    toast?.type === 'success'
      ? DARK_COLORS.onPrimary
      : COLORS.onPrimary;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          accessible
          accessibilityLabel={toast.message}
          style={[
            styles.toast,
            SHADOW,
            {
              backgroundColor: bg,
              bottom: insets.bottom + SPACING.lg,
              opacity,
              transform: [
                {
                  translateY: opacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <MaterialIcons
            name={ICONS[toast.type] || ICONS.info}
            size={26}
            color={fg}
          />
          <Text style={[styles.text, { color: fg }]}>
            {toast.message}
          </Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  text: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
  },
});
