// server/src/routes/stats.routes.js

import { Router } from "express";
import { getTotalPublishedPosts } from "../events/listeners/countpubposts.listener.js";

const router = Router();

router.get("/stats", (req, res) => {
  res.status(200).json({ totalPublishedPosts: getTotalPublishedPosts() });
});

export default router;
