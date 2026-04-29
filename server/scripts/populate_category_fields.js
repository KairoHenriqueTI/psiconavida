const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const file = path.join(__dirname, 'category_updates.json');
  if (!fs.existsSync(file)) {
    console.log('No category_updates.json found. Create one at', file);
    process.exit(0);
  }
  const updates = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const u of updates) {
    console.log('Updating', u.slug);
    await prisma.category.updateMany({ where: { slug: u.slug }, data: { description: u.description || null, image: u.image || null } });
  }
  console.log('Done');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
