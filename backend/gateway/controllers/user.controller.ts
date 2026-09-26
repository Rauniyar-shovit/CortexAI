import type { Request, Response } from "express";

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    return res.status(500).json({ message: `get current user error ${error}` });
  }
};
