#!/bin/sh
set -e

echo "Gerando o cliente Prisma para o ambiente de produção..."
npm run generate

echo "Executando migrações do banco de dados..."
npm run migrate:prod

echo "Iniciando o servidor..."
exec "$@"