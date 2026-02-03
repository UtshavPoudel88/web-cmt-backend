import { Request, Response, NextFunction } from "express";
import { authenticate, AuthPayload } from "./auth.middleware";

export function adminGuard(req: Request, res: Response, next: NextFunction) {
  return authenticate(req, res, () => {
    const user = (req as Request & { user?: AuthPayload }).user;
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    return next();
  });
}
