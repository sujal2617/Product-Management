import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { createClient } from '@supabase/supabase-js';

import { auth } from './firebase';

// Send the Firebase ID token to Supabase so RLS can identify the user.
// Keep false until Supabase Third-Party Auth (Firebase) is enabled and users
// have the role claim (see docs/RLS_SETUP.md). Flip to true, then apply 002.
export const USE_FIREBASE_TOKEN = false;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// accessToken and the auth option cannot be combined; the app never uses supabase.auth.
const options = USE_FIREBASE_TOKEN
    ? {
        accessToken: async () =>
            auth.currentUser
                ? await auth.currentUser.getIdToken()
                : null,
    }
    : {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        },
    };

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    options
);
