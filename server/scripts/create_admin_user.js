const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const name = process.argv[3] || null;
  const password = process.argv[4] || null;
  if (!email) {
    console.error('Usage: node create_admin_user.js <email> [name]');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  const data = { role: 'admin', name: name || existing?.name };
  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    data.hashedPassword = hashed;
  }

  if (existing) {
    console.log('User exists, updating role to admin:', email);
    await prisma.user.update({ where: { email }, data });
  } else {
    console.log('Creating admin user:', email);
    await prisma.user.create({ data: { email, ...data } });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  console.log('Result:', { id: user.id, email: user.email, role: user.role, name: user.name });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
