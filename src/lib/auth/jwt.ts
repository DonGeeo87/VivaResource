import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "viva-migracion-dev-secret-2026";
const TOKEN_EXPIRY = "7d";

export interface JwtPayload {
  uid: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  type: "admin" | "volunteer";
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenFromHeader(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7);
}
