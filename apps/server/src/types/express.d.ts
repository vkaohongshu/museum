declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      nickname: string | null;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
