#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p ~/cleanit-erp-fresh/backups
PGPASSWORD=npg_a49CyndEqlLG pg_dump \
  -h ep-falling-meadow-abfyirgi-pooler.eu-west-2.aws.neon.tech \
  -U neondb_owner -d neondb \
  -f ~/cleanit-erp-fresh/backups/cleanit_$DATE.sql 2>/dev/null \
  && echo "Backup OK: cleanit_$DATE.sql" \
  || echo "Installer postgresql-client: sudo apt install postgresql-client"
