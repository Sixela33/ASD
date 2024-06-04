#!/bin/bash

sleep 10

echo "listen_addresses = '*'" >> /var/lib/postgresql/data/postgresql.conf

echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf

pg_ctl restart -D /var/lib/postgresql/data