import express from "express";
import { nanoid } from "nanoid";
import redis from "../redis.js";
import { now } from "../utils.js";

const router = express.Router();
const PREFIX = "paste:";

router.post("/pastes", async (req, res) => {
  const { content, ttl_seconds, max_views } = req.body;

  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "Invalid content" });
  }

  if (ttl_seconds && ttl_seconds < 1) {
    return res.status(400).json({ error: "Invalid ttl_seconds" });
  }

  if (max_views && max_views < 1) {
    return res.status(400).json({ error: "Invalid max_views" });
  }

  const id = nanoid(8);

  const paste = {
    content,
    createdAt: Date.now(),
    ttl: ttl_seconds ? ttl_seconds * 1000 : null,
    maxViews: max_views ?? null,
    views: 0
  };

  await redis.set(`paste:${id}`, JSON.stringify(paste));

  res.json({
    id,
  });
});

router.get("/pastes/:id", async (req, res) => {
  const raw = await redis.get(`paste:${req.params.id}`);
  if (!raw) return res.status(404).json({ error: "Not found" });

  const paste = JSON.parse(raw);
  const currentTime = now(req);

  if (paste.ttl && currentTime > paste.createdAt + paste.ttl) {
    await redis.del(`paste:${req.params.id}`);
    return res.status(404).json({ error: "Expired" });
  }

  if (paste.maxViews && paste.views >= paste.maxViews) {
    return res.status(404).json({ error: "View limit reached" });
  }

  paste.views += 1;
  await redis.set(`paste:${req.params.id}`, JSON.stringify(paste));

  res.json({
    content: paste.content,
    remaining_views: paste.maxViews
      ? paste.maxViews - paste.views
      : null,
    expires_at: paste.ttl
      ? new Date(paste.createdAt + paste.ttl).toISOString()
      : null
  });
});


router.get("/p/:id", async (req, res) => {
  const raw = await redis.get(`paste:${req.params.id}`);
  if (!raw) return res.status(404).send("Not found");

  const paste = JSON.parse(raw);

  if (paste.ttl && Date.now() > paste.createdAt + paste.ttl) {
    return res.status(404).send("Expired");
  }

  if (paste.maxViews && paste.views >= paste.maxViews) {
    return res.status(404).send("View limit reached");
  }

  paste.views += 1;
  await redis.set(`paste:${req.params.id}`, JSON.stringify(paste));

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Paste</title>
      <style>
        body { font-family: monospace; background:#111; color:#0f0; padding:20px; }
        pre { white-space: pre-wrap; }
      </style>
    </head>
    <body>
      <pre>${paste.content.replace(/</g, "&lt;")}</pre>
    </body>
    </html>
  `);
});

export default router;

