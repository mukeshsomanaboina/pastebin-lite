import express from "express";
import redis from "../redis.js";

const router = express.Router();

router.get("/healthz", async (req, res) => {
  try {
    await redis.ping();
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

export default router;
