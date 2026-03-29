import { Request, Response, NextFunction } from "express";

export interface RequestWithInstitution extends Request {
  institutionId?: string;
}

export const institutionMiddleware = (req: RequestWithInstitution, res: Response, next: NextFunction) => {
  const institutionId = req.header("x-institution-id");
  
  // Skip check for certain routes if needed (e.g., getting the list of institutions)
  if (req.path === "/api/institutions" && req.method === "GET") {
    return next();
  }

  if (!institutionId) {
    return res.status(400).json({ error: "Missing x-institution-id header" });
  }

  req.institutionId = institutionId;
  next();
};
