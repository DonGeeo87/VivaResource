import jwt from "jsonwebtoken";

const DEV_FALLBACK = "viva-migracion-dev-secret-2026";
// El valor por defecto está publicado en el repo: en producción, sin JWT_SECRET
// configurado, cualquiera podría fabricarse un token de admin. Por eso en
// producción NO se cae al default: sin la variable se rechazan todos los tokens
// (el login falla ruidosamente, pero nadie puede falsificar una sesión).
const JWT_SECRET =
  process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : DEV_FALLBACK);

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.error(
    "[auth] JWT_SECRET no configurado: se rechazan todos los tokens. Configuralo en el entorno del contenedor."
  );
}
const TOKEN_EXPIRY = "7d";

export interface JwtPayload {
  uid: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  type: "admin" | "volunteer";
}

export function signToken(payload: JwtPayload): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET no configurado");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JwtPayload | null {
  if (!JWT_SECRET) return null;
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
