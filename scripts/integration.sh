#!/usr/bin/env bash

DIR="$(cd "$(dirname "$0")" && pwd)"

source $DIR/set-env.sh

docker-compose up postgres-test -d

echo '⏳[test]: setting up database...'

$DIR/wait-for-it.sh "${DATABASE_URL}" -- echo '✅[test]: database is ready'

npx prisma migrate dev

vitest "$@" -c ./vitest.config.integration.ts
