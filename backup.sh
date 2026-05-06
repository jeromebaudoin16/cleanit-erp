#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p ~/cleanit-erp/backups
cp ~/cleanit-erp/frontend/src/pages/CleanITBooks.jsx ~/cleanit-erp/backups/CleanITBooks_$TIMESTAMP.jsx
cp ~/cleanit-erp/frontend/src/App.jsx ~/cleanit-erp/backups/App_$TIMESTAMP.jsx
ls -t ~/cleanit-erp/backups/CleanITBooks_*.jsx | tail -n +11 | xargs rm -f 2>/dev/null
echo "Backup OK: $TIMESTAMP"
