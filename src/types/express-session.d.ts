import 'express-session';
import { User } from '../users/entities/user.entity';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: User | null;
    }
  }
}
