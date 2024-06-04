#!/bin/bash

set -eu
set -o pipefail

source ./env.sh

echo "Creating backup of $POSTGRES_DB_NAME database..."
pg_dump --format=custom \
        -h $POSTGRES_DB_HOST \
        -p $POSTGRES_DB_PORT \
        -U $POSTGRES_DB_USER \
        -d $POSTGRES_DB_NAME \
        $PGDUMP_EXTRA_OPTS \
        > db.dump

timestamp=$(date +"%Y-%m-%dT%H:%M:%S")
s3_uri_base="s3://${AWS_S3_BACKUPS_BUCKET_NAME}/${POSTGRES_DB_NAME}_${timestamp}.dump"

if [ -n "$PASSPHRASE" ]; then
  echo "Encrypting backup..."
  rm -f db.dump.gpg
  gpg --symmetric --batch --passphrase "$PASSPHRASE" db.dump
  rm db.dump
  local_file="db.dump.gpg"
  s3_uri="${s3_uri_base}.gpg"
else
  local_file="db.dump"
  s3_uri="$s3_uri_base"
fi

echo "Uploading backup to $AWS_S3_BACKUPS_BUCKET_NAME..."
aws $aws_args s3 cp "$local_file" "$s3_uri"
rm "$local_file"

echo "Backup complete."

if [ -n "$BACKUP_KEEP_DAYS" ]; then
  sec=$((86400*BACKUP_KEEP_DAYS))
  date_from_remove=$(date -d "@$(($(date +%s) - sec))" +%Y-%m-%d)
  backups_query="Contents[?LastModified<='${date_from_remove} 00:00:00'].{Key: Key}"

  echo "Removing old backups from $AWS_S3_BACKUPS_BUCKET_NAME..."
  aws $aws_args s3api list-objects \
    --bucket "${AWS_S3_BACKUPS_BUCKET_NAME}" \
    --prefix "${POSTGRES_DB_NAME}" \
    --query "${backups_query}" \
    --output text \
    | xargs -n1 -t -I 'KEY' aws $aws_args s3 rm s3://"${AWS_S3_BACKUPS_BUCKET_NAME}"/'KEY'
  echo "Removal complete."
fi
