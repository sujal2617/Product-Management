import { initializeApp } from 'firebase/app';

import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from 'firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC8BSAPAuTmSfK-EA1IT6v34JiAxbVaBMY",
  authDomain: "dady-53672.firebaseapp.com",
  projectId: "dady-53672",
  storageBucket: "dady-53672.firebasestorage.app",
  messagingSenderId: "724444826639",
  appId: "1:724444826639:web:d11c1fcf4c4d7d2b9ca77a",
  measurementId: "G-8KPY8Q4EN6"
};

const app = initializeApp(firebaseConfig);

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

export { auth };