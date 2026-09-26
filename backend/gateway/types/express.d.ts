import SessionUser from "../../shared/types/types.ts";

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

export {};
