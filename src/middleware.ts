import { NextRequest, NextResponse } from "next/server";

/**
 * Routing de idioma para indexacion en buscadores.
 *
 * El sitio decide el idioma en el cliente con localStorage ("viva-lang"), asi
 * que Google (que no ejecuta JS ni tiene localStorage) solo veia la version en
 * ingles: la comunidad hispanohablante no podia encontrarlo en espanol.
 *
 * Solucion: URLs reales con prefijo /es. El middleware detecta el prefijo,
 * marca la cookie y reescribe internamente a la ruta original para reusar las
 * mismas paginas (sin duplicar componentes). El layout raiz lee la cookie y
 * renderiza el HTML en el idioma correcto desde el servidor.
 *
 * - /es           -> reescribe a /        (cookie es)
 * - /es/about     -> reescribe a /about   (cookie es)
 * - /about        -> sin cambios          (cookie en)
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;

  const isSpanish = pathname === "/es" || pathname.startsWith("/es/");

  // Ruta interna a la que reescribimos (sin el prefijo de idioma).
  const internalPath = isSpanish
    ? pathname.replace(/^\/es(?=\/|$)/, "") || "/"
    : pathname;

  const url = request.nextUrl.clone();
  url.pathname = internalPath;
  url.search = search;

  const headers = new Headers(request.headers);
  // El layout raiz necesita el path publico (con prefijo) para el canonical.
  headers.set("x-public-path", pathname);

  const response = NextResponse.rewrite(url, {
    request: { headers },
  });

  // La cookie manda en el servidor: es la que hace que el SSR salga en espanol.
  // Se marca tanto en /es como en las rutas en ingles, para que el idioma no
  // quede "pegado" al navegar entre ambas versiones.
  response.cookies.set("viva-lang", isSpanish ? "es" : "en", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  // Excluye assets, API y los internos de Next.
  matcher: [
    "/((?!api|_next/static|_next/image|admin|favicon.ico|og-viva.jpg|logo.png|logo-rectangular.png|apple-touch-icon.png|favicon-vivaresource.png|robots.txt|sitemap.xml|llms.txt|photo-bank|.*\\.(?:png|jpg|jpeg|avif|webp|svg|ico|txt|xml|json)$).*)",
  ],
};
