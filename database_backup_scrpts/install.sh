#!/bin/bash

set -eux
set -o pipefail

# Update package list
apt-get update

# Install pg_dump
apt-get install -y postgresql-client

# Install gpg
apt-get install -y gnupg

# Install AWS CLI version 2
apt-get install -y unzip
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf awscliv2.zip aws

# Install go-cron
apt-get install -y curl
if [ -z "${TARGETARCH:-}" ]; then
  echo "TARGETARCH is not set"
  exit 1
fi
curl -L "https://github.com/ivoronin/go-cron/releases/download/v0.0.5/go-cron_0.0.5_linux_${TARGETARCH}.tar.gz" -O
tar xvf "go-cron_0.0.5_linux_${TARGETARCH}.tar.gz"
rm "go-cron_0.0.5_linux_${TARGETARCH}.tar.gz"
mv go-cron /usr/local/bin/go-cron
chmod u+x /usr/local/bin/go-cron

# Cleanup
rm -rf /var/lib/apt/lists/*
