#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('Reading imported tables from database via Prisma raw queries');

  // Read categories
  const categories = await prisma.$queryRaw`
    SELECT id, name, slug, description, image, created_at, updated_at FROM public.categories`;

  // Upsert categories into Prisma Category
  for (const c of categories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        slug: c.slug,
      },
      create: {
        id: c.id,
        name: c.name,
        slug: c.slug,
      },
    });
  }
  console.log(`Upserted ${categories.length} categories`);

  // Create a default author user for posts if author string exists
  const authorName = 'Dra. Ana Silva';
  let author = await prisma.user.findFirst({ where: { name: authorName } });
  if (!author) {
    author = await prisma.user.create({ data: { name: authorName, role: 'editor' } });
    console.log('Created author user', author.id);
  }

  // Read posts
  const posts = await prisma.$queryRaw`
    SELECT id, title, slug, excerpt, content, image, category_id, author, read_time, published, date, created_at, updated_at FROM public.posts`;

  for (const p of posts) {
    // map fields to Prisma Post
    const categoryId = p.category_id || null;
    const published = !!p.published;
    const createdAt = p.created_at ? new Date(p.created_at) : undefined;
    const updatedAt = p.updated_at ? new Date(p.updated_at) : undefined;

    await prisma.post.upsert({
      where: { id: p.id },
      update: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        image: p.image,
        published,
        authorId: author.id,
        categoryId: categoryId,
        createdAt,
        updatedAt,
      },
      create: {
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        image: p.image,
        published,
        authorId: author.id,
        categoryId: categoryId,
        createdAt,
        updatedAt,
      },
    });
  }
  console.log(`Upserted ${posts.length} posts`);

  // site_content -> SiteContent model mapping: section_key -> key, content -> value (stringify)
  const site = await prisma.$queryRaw`SELECT id, section_key, content, created_at, updated_at FROM public.site_content`;
  for (const s of site) {
    const key = s.section_key;
    const value = typeof s.content === 'string' ? s.content : JSON.stringify(s.content);
    await prisma.siteContent.upsert({
      where: { key },
      update: { value },
      create: { id: s.id, key, value },
    });
  }
  console.log(`Upserted ${site.length} site content entries`);

  console.log('Migration to Prisma models complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
