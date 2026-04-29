#!/bin/sh
set -eu

wait_for_db() {
  node <<'NODE'
const net = require('net');
const host = process.env.DATABASE_HOST || 'db';
const port = Number(process.env.DATABASE_PORT || 5432);
const timeout = 2000;
const start = Date.now();

function tryConnect() {
  const socket = net.createConnection({ host, port });
  socket.on('connect', () => {
    socket.end();
    process.exit(0);
  });
  socket.on('error', () => {
    socket.destroy();
    if (Date.now() - start > 120000) process.exit(1);
    setTimeout(tryConnect, timeout);
  });
}

tryConnect();
NODE
}

wait_for_db
npx prisma migrate deploy

if [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
  node scripts/create_admin_user.js "$ADMIN_EMAIL" "${ADMIN_NAME:-Admin}" "$ADMIN_PASSWORD"
fi

exec npm start
