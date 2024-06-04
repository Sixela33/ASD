#!/bin/bash

if [ -z "$AWS_S3_BACKUPS_BUCKET_NAME" ]; then
  echo "You need to set the AWS_S3_BACKUPS_BUCKET_NAME environment variable."
  exit 1
fi

if [ -z "$POSTGRES_DB_NAME" ]; then
  echo "You need to set the POSTGRES_DB_NAME environment variable."
  exit 1
fi

if [ -z "$POSTGRES_DB_HOST" ]; then
  echo "You need to set the POSTGRES_DB_HOST environment variable."
  exit 1
fi

if [ -z "$POSTGRES_DB_USER" ]; then
  echo "You need to set the POSTGRES_DB_USER environment variable."
  exit 1
fi

if [ -z "$POSTGRES_DB_PASSWORD" ]; then
  echo "You need to set the POSTGRES_DB_PASSWORD environment variable."
  exit 1
fi

if [ -z "$S3_ENDPOINT" ]; then
  aws_args=""
else
  aws_args="--endpoint-url $S3_ENDPOINT"
fi

if [ -n "$AWS_BACKUP_ACCESS_KEY" ]; then
  export AWS_ACCESS_KEY_ID=$AWS_BACKUP_ACCESS_KEY
fi

if [ -n "$AWS_BACKUP_SECRET_ACCESS_KEY" ]; then
  export AWS_SECRET_ACCESS_KEY=$AWS_BACKUP_SECRET_ACCESS_KEY
fi

export AWS_DEFAULT_REGION=$S3_REGION
export PGPASSWORD=$POSTGRES_DB_PASSWORD
