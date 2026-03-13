import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user
export interface AuthRequest extends Request {
  user?: any;
}

export default function auth(req: AuthRequest, res: Response, next: NextFunction) {
  // Get token from header
  const authHeader = req.header('Authorization');

  // Check if no header or wrong format (Expect "Bearer <token>")
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token, (process.env.JWT_ACCESS_SECRET as string) || 'secret123');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

// Role-based authorization middleware
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access denied: insufficient permissions' });
    }
    next();
  };
};
