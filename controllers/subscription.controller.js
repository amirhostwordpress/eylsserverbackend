import Subscription from "../models/subscription.model.js";

export const createSubscription = async (req, res) => {
  try {
    const { email, userId = null, source = null } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const [subscription, created] = await Subscription.findOrCreate({
      where: { email },
      defaults: { userId, source },
    });

    if (!created) {
      if (subscription.status === "subscribed")
        return res
          .status(200)
          .json({ message: "Already subscribed", subscription });

      subscription.status = "subscribed";
      subscription.userId = subscription.userId || userId;
      subscription.source = subscription.source || source;
      await subscription.save();
      return res.status(200).json({ message: "Resubscribed", subscription });
    }

    return res.status(201).json({ message: "Subscribed", subscription });
  } catch (error) {
    console.error("createSubscription error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const unsubscribe = async (req, res) => {
  try {
    const { id, email } = req.body;
    if (!id && !email)
      return res
        .status(400)
        .json({ message: "Provide id or email to unsubscribe" });

    const subscription = id
      ? await Subscription.findByPk(id)
      : await Subscription.findOne({ where: { email } });

    if (!subscription)
      return res.status(404).json({ message: "Subscription not found" });

    subscription.status = "unsubscribed";
    await subscription.save();
    return res.json({ message: "Unsubscribed", subscription });
  } catch (error) {
    console.error("unsubscribe error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const listSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.json(subscriptions);
  } catch (error) {
    console.error("listSubscriptions error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
