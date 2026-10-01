// server/src/repositories/post.repository.js

import { prisma } from "../db/client.js";

export const PostRepository = {
  create({ authorId, title, body, status, publishedAt }) {
    return prisma.post.create({
      data: { authorId, title, body, status, publishedAt },
    });
  },

  // Called by PostService.publish() (Lecture 9): creates the post and its
  // tags in one step. Tags are connectOrCreate so the same tag name is
  // reused across posts instead of duplicated.
  createWithTags({ authorId, title, body, tagNames, status, publishedAt }) {
    return prisma.post.create({
      data: {
        authorId,
        title,
        body,
        status,
        publishedAt,
        tags: {
          create: tagNames.map((name) => ({
            tag: { connectOrCreate: { where: { name }, create: { name } } },
          })),
        },
      },
      include: { tags: { include: { tag: true } } },
    });
  },

  async findPublished({ page, pageSize }) {
    const rows = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize + 1, // fetch one extra row to compute hasMore
    });
    const hasMore = rows.length > pageSize;
    return { posts: rows.slice(0, pageSize), hasMore };
  },

  async searchPublished({ query, page, pageSize }) {
    const where = {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { body: { contains: query, mode: "insensitive" } },
      ],
    };
    const rows = await prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize + 1,
    });
    const hasMore = rows.length > pageSize;
    return { posts: rows.slice(0, pageSize), hasMore };
  },
};
