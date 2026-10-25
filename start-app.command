#!/bin/bash
# Double-click to start the DP app for testing. Scan the QR code:
#   Android (OnePlus): open Expo Go -> Scan QR code
#   iPhone: open the Camera app and point it at the QR code
# Uses a tunnel, so the phone works on any network (mobile data or other Wi-Fi).
# Keep this window open while using the app; close it to stop.
cd "$(dirname "$0")"
npx expo start --go --tunnel --clear
