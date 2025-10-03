import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import Subscription from "../entities/Subscription";

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const subscriptionRepository = AppDataSource.getRepository(Subscription);
    const follower_id = (req as any).userId;
    const { followed_id } = req.body;

    if (!followed_id) {
      return res.status(400).json({ message: "Followed user ID is required" });
    }

    if (follower_id === followed_id) {
      return res.status(400).json({ message: "Cannot subscribe to yourself" });
    }

    const existingSubscription = await subscriptionRepository.findOne({
      where: {
        follower_id: follower_id,
        followed_id: followed_id,
      },
    });

    if (existingSubscription) {
      return res.status(400).json({ message: "Already subscribed" });
    }

    const newSubscription = subscriptionRepository.create({
      follower_id: follower_id,
      followed_id: followed_id,
    });

    await subscriptionRepository.save(newSubscription);
    res.status(201).json(newSubscription);
  } catch (error: any) {
    console.error("Create subscription error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const getSubscriptionById = async (req: Request, res: Response) => {
  try {
    const subscriptionRepository = AppDataSource.getRepository(Subscription);
    const subscription = await subscriptionRepository.findOne({
      where: { subscription_id: parseInt(req.params.id) },
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.json(subscription);
  } catch (error: any) {
    console.error("Get subscription error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const deleteSubscription = async (req: Request, res: Response) => {
  try {
    const subscriptionRepository = AppDataSource.getRepository(Subscription);
    const userId = (req as any).userId;

    const subscription = await subscriptionRepository.findOneBy({
      subscription_id: parseInt(req.params.id),
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (subscription.follower_id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await subscriptionRepository.delete(
      subscription.subscription_id
    );

    if (result.affected === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.json({ message: "Subscription deleted successfully" });
  } catch (error: any) {
    console.error("Delete subscription error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const deleteSubscriptionByUser = async (req: Request, res: Response) => {
  try {
    const subscriptionRepository = AppDataSource.getRepository(Subscription);
    const follower_id = (req as any).userId;
    const { followed_id } = req.params;

    const subscription = await subscriptionRepository.findOne({
      where: {
        follower_id: follower_id,
        followed_id: parseInt(followed_id),
      },
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const result = await subscriptionRepository.delete(
      subscription.subscription_id
    );

    if (result.affected === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.json({ message: "Subscription deleted successfully" });
  } catch (error: any) {
    console.error("Delete subscription by user error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const getFollowers = async (req: Request, res: Response) => {
  try {
    const subscriptionRepository = AppDataSource.getRepository(Subscription);
    const user_id = parseInt(req.params.user_id);

    const followers = await subscriptionRepository.find({
      where: { followed_id: user_id },
    });

    const followerIds = followers.map((sub) => ({
      follower_id: sub.follower_id,
      subscription_id: sub.subscription_id,
      created_at: sub.created_at,
    }));

    res.json(followerIds);
  } catch (error: any) {
    console.error("Get followers error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const getFollowing = async (req: Request, res: Response) => {
  try {
    const subscriptionRepository = AppDataSource.getRepository(Subscription);
    const user_id = parseInt(req.params.user_id);

    const following = await subscriptionRepository.find({
      where: { follower_id: user_id },
    });

    const followingIds = following.map((sub) => ({
      followed_id: sub.followed_id,
      subscription_id: sub.subscription_id,
      created_at: sub.created_at,
    }));

    res.json(followingIds);
  } catch (error: any) {
    console.error("Get following error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const checkSubscription = async (req: Request, res: Response) => {
  try {
    const subscriptionRepository = AppDataSource.getRepository(Subscription);
    const follower_id = (req as any).userId;
    const { followed_id } = req.params;

    const subscription = await subscriptionRepository.findOne({
      where: {
        follower_id: follower_id,
        followed_id: parseInt(followed_id),
      },
    });

    res.json({ is_subscribed: !!subscription });
  } catch (error: any) {
    console.error("Check subscription error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
