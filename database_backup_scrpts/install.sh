#! /bin/sh

set -eux
set -o pipefail

apt-get update

# install pg_dump
apt-get add postgresql-client

# install gpg
apt-get add gnupg

apt-get add aws-cli

# install go-cron
apt-get add curl
curl -L https://github.com/ivoronin/go-cron/releases/download/v0.0.5/go-cron_0.0.5_linux_${TARGETARCH}.tar.gz -O
tar xvf go-cron_0.0.5_linux_${TARGETARCH}.tar.gz
rm go-cron_0.0.5_linux_${TARGETARCH}.tar.gz
mv go-cron /usr/local/bin/go-cron
chmod u+x /usr/local/bin/go-cron
apt-get del curl


# cleanup
rm -rf /var/cache/apt-get/*
