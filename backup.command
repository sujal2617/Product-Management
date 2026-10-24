#!/bin/bash
# Double-click to back up all Supabase tables into the backup folder.
cd "$(dirname "$0")"
node scripts/backup.js
echo
read -n 1 -s -r -p "Press any key to close..."
