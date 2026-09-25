import { getAuth } from "firebase-admin/auth";
import type { Request, Response } from "express";
import { app } from "../config/firebase.ts";
import User from "../models/user.model.ts";
import redis from "../../../shared/redis/redis.ts";

export const login = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const decoded = await getAuth(app).verifyIdToken(token);
    let user = await User.findOne({
      firebaseUid: decoded.uid,
    });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name,
        email: decoded.email,
        avatar: decoded.picture,
      });
    }

    const sessionId = crypto.randomUUID();
    const sessionTtl = 7 * 24 * 60 * 60;

    await redis.set(
      `session-${sessionId}`,
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      }),
      "EX",
      sessionTtl,
    );

    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: sessionTtl * 1000,
    });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `login error ${error}` });
  }
};

export const logOut = async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies?.session;

    await redis.del(`session-${sessionId}`);

    res.clearCookie("session");

    return res.status(200).json({ message: "logout successful" });
  } catch (error) {
    return res.status(500).json({ message: `logout error ${error}` });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    return res.status(500).json({ message: `get current user error ${error}` });
  }
};
