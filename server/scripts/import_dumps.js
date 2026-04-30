const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const dumpsDir = path.join(__dirname, "..", "dumps");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(dumpsDir, file), "utf8"));
}

function asDate(value) {
  return value ? new Date(value) : undefined;
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@psiconavida.com";
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    throw new Error(`Admin user not found: ${adminEmail}`);
  }

  const categories = readJson("categories.json");
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        slug: category.slug,
        description: category.description || null,
        image: category.image || null,
      },
      create: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || null,
        image: category.image || null,
      },
    });
  }

  const posts = readJson("posts.json");
  for (const post of posts) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || null,
        content: post.content || "",
        image: post.image || null,
        published: !!post.published,
        categoryId: post.category_id || null,
        authorId: admin.id,
        createdAt: asDate(post.created_at),
        updatedAt: asDate(post.updated_at) || new Date(),
      },
      create: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || null,
        content: post.content || "",
        image: post.image || null,
        published: !!post.published,
        categoryId: post.category_id || null,
        authorId: admin.id,
        createdAt: asDate(post.created_at),
        updatedAt: asDate(post.updated_at) || new Date(),
      },
    });
  }

  const siteContent = readJson("site_content.json");
  for (const entry of siteContent) {
    const key = entry.key || entry.section_key;
    const value = typeof entry.value === "string" ? entry.value : JSON.stringify(entry.content ?? entry.value ?? {});
    await prisma.siteContent.upsert({
      where: { key },
      update: { value },
      create: {
        id: entry.id,
        key,
        value,
      },
    });
  }

  console.log("Import complete:", {
    categories: categories.length,
    posts: posts.length,
    siteContent: siteContent.length,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
