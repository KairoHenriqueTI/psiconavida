const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main(){
  const email = process.argv[2];
  if (!email) { console.error('Usage: node dump_user.js <email>'); process.exit(1); }
  const user = await prisma.user.findUnique({ where: { email } });
  console.log(user);
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
