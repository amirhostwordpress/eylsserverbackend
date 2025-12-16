import express from "express";
import {
  createSubscription,
  unsubscribe,
  listSubscriptions,
} from "../controllers/subscription.controller.js";

const router = express.Router();

router.post("/subscribe", createSubscription);
router.post("/unsubscribe", unsubscribe);
router.get("/", listSubscriptions);

export default router;
