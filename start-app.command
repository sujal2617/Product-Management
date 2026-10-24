#!/bin/bash
# Double-click to start the DP app. Scan the QR code:
#   Android (OnePlus): open Expo Go -> Scan QR code
#   iPhone: open the Camera app and point it at the QR code
# Phone and Mac must be on the same Wi-Fi. Keep this window open while using the app.
# If the phone can't connect, close this window and run: npx expo start --tunnel
cd "$(dirname "$0")"
npx expo start --go --clear
