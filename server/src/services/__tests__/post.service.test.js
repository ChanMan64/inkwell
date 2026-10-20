// server/src/services/__tests__/post.service.test.js

import { jest } from "@jest/globals";

const mockPostRepository = { createWithTags: jest.fn(), searchPublished: jest.fn() };
const mockEventBus = { emit: jest.fn() };

jest.unstable_mockModule("../../repositories/post.repository.js", () => ({
  PostRepository: mockPostRepository,
}));
jest.unstable_mockModule("../../events/event-bus.js", () => ({
  EventBus: mockEventBus,
}));

const { PostService } = await import("../post.service.js");

test("publish() creates a PUBLISHED post and emits post.published", async () => {
  mockPostRepository.createWithTags.mockResolvedValue({ id: "p1", title: "Hello", status: "PUBLISHED" });

  const post = await PostService.publish({ authorId: "u1", title: "Hello", body: "World" });

  expect(post.status).toBe("PUBLISHED");
  expect(mockEventBus.emit).toHaveBeenCalledWith(
    "post.published",
    expect.objectContaining({ postId: "p1" })
  );
});

test("publish() rejects an empty title", async () => {
  await expect(
    PostService.publish({ authorId: "u1", title: "", body: "World" })
  ).rejects.toThrow();
});

describe("PostService.search", () => {
  test("search finds a post that matches (row 1)", async () => {
    mockPostRepository.searchPublished.mockResolvedValue({
      posts: [{ id: "p1", title: "On Modularity" }],
      hasMore: false,
    });

    const result = await PostService.search({ query: "modularity" });

    expect(result.posts[0].title).toBe("On Modularity");
  });

  test("search with no matches gives an empty list (row 2)", async () => {
    mockPostRepository.searchPublished.mockResolvedValue({ posts: [], hasMore: false });

    const result = await PostService.search({ query: "zzzzz" });

    expect(result.posts).toEqual([]);
  });

  test("search uses page 1 and 10 posts per page by default (row 3, white-box)", async () => {
    mockPostRepository.searchPublished.mockResolvedValue({ posts: [], hasMore: false });

    await PostService.search({ query: "anything" });

    expect(mockPostRepository.searchPublished).toHaveBeenCalledWith({
      query: "anything",
      page: 1,
      pageSize: 10,
    });
  });

  test("hasMore comes back true when there are more results (row 4)", async () => {
    mockPostRepository.searchPublished.mockResolvedValue({ posts: [{ id: "p1" }], hasMore: true });

    const result = await PostService.search({ query: "post" });

    expect(result.hasMore).toBe(true);
  });
});
