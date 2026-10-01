// server/src/events/listeners/countpubposts.listener.js
//
// Second listener: counts how many posts have been published
// since the server started.

import { EventBus } from "../event-bus.js";

let totalPublishedPosts = 0;

EventBus.on("post.published", () => {
  totalPublishedPosts = totalPublishedPosts + 1;
});

export function getTotalPublishedPosts() {
  return totalPublishedPosts;
}
