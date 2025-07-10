#!/bin/sh
set -e

echo "Executando migrações do banco de dados..."
npm run migrate:prod

exec "$@"