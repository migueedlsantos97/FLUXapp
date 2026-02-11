import session from "express-session";
import type { Express, RequestHandler } from "express";
import MemoryStore from "memorystore";

const isReplitEnv = !!(process.env.REPL_ID && process.env.ISSUER_URL);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const MemStore = MemoryStore(session);
  return session({
    secret: process.env.SESSION_SECRET || "flux-app-dev-secret",
    store: new MemStore({ checkPeriod: sessionTtl }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  if (isReplitEnv) {
    console.log("Replit environment detected, but OIDC auth is disabled in this deployment.");
  }

  // Provide stub auth routes so the app doesn't crash
  app.get("/api/login", (_req, res) => {
    res.redirect("/");
  });

  app.get("/api/callback", (_req, res) => {
    res.redirect("/");
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // In non-Replit environments, allow all requests through with a demo user
  if (!isReplitEnv) {
    (req as any).user = {
      claims: { sub: "demo-user" },
    };
    return next();
  }

  const user = (req as any).user;
  if (!req.isAuthenticated || !req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return next();
};
