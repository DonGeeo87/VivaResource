#!/usr/bin/env python3
"""
Viva SEO Monitor - vigila la salud SEO de vivaresource.com.

Complementa a blindaje-viva.py: aquel vigila la CONFIG (canonical, proxies,
compose, auth). Este vigila el SEO: titulos, metadatos, OG, sitemap, redirects.

Silent-on-idle: no imprime NADA si todo esta bien (no genera notificaciones).
Alerta solo cuando detecta una regresion respecto al baseline.

Uso:
    python3 viva-seo-monitor.py            # silencioso si todo OK
    python3 viva-seo-monitor.py --verbose  # imprime siempre el detalle
"""

import html as htmllib
import json
import os
import re
import sys
import urllib.error
import urllib.request

BASE = "https://www.vivaresource.com"
BASELINE = "/root/.hermes/state/viva-seo-baseline.json"
UA = "Mozilla/5.0 (compatible; VivaSeoMonitor/1.0)"
TIMEOUT = 25

# Valores esperados: si el sitio se desvia de esto, es una regresion.
EXPECTED_TITLES = {
    "/": "Viva Resource | Community Resources in Rural Colorado",
    "/about": "About Us — Our Mission in Rural Colorado | Viva Resource",
    "/blog": "Blog — Community Stories & Local Resources | Viva Resource",
    "/donate": "Donate — Support Rural Colorado Families | Viva Resource",
    "/get-help": "Get Help — Free Community Resources | Viva Resource",
}
EXPECTED_CANONICAL = BASE
MIN_SITEMAP_URLS = 40          # hoy 47; si baja de 40, algo se rompio
MIN_BLOG_POSTS_IN_SITEMAP = 20  # hoy 28

# Frases que NO deben reaparecer: el posicionamiento es comunitario, no
# exclusivamente migratorio, y la marca es "Viva Resource" sin "Foundation".
FORBIDDEN = [
    "Immigrant Resources in Colorado",
    "Viva Resource Foundation",
    "ayuda inmigrante Denver",
]

# Rutas que deben resolver 200 (redirects y paginas clave).
MUST_RESOLVE = [
    "/",
    "/about", "/blog", "/donate", "/get-help", "/resources", "/get-involved",
    "/blog/how-to-volunteer-guide-en",
    "/blog/legal-aid-referrals-colorado-en",
    "/blog/resources-available-for-the-community-en",
    "/blog/community-resource-fair-2026-en",
    "/og-viva.jpg",
    # URLs legacy: deben redirigir, no dar 404
    "/blog/how-to-volunteer-guide",
    "/post/viva-resource-empowering-communities-transforming-lives",
]


def fetch(path, follow=True):
    """Devuelve (status, body) o (None, str(error))."""
    url = path if path.startswith("http") else BASE + path
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception as e:
        return None, str(e)[:80]


def meta(html, attr, value):
    """Extrae el content de <meta {attr}="{value}" content="...">."""
    m = re.search(
        r'<meta[^>]*' + attr + r'="' + re.escape(value) + r'"[^>]*content="([^"]*)"',
        html, re.I)
    if not m:
        m = re.search(
            r'<meta[^>]*content="([^"]*)"[^>]*' + attr + r'="' + re.escape(value) + r'"',
            html, re.I)
    return htmllib.unescape(m.group(1)) if m else None


def title(html):
    m = re.search(r"<title[^>]*>(.*?)</title>", html, re.S | re.I)
    # El HTML escapa & como &amp;; normalizar antes de comparar.
    return htmllib.unescape(m.group(1).strip()) if m else None


def main():
    verbose = "--verbose" in sys.argv
    fails = []
    notes = []

    # --- 1. Titulos por pagina (la causa #1 de CTR bajo) ---
    for path, expected in EXPECTED_TITLES.items():
        status, html = fetch(path)
        if status != 200:
            fails.append(f"{path}: HTTP {status}")
            continue
        actual = title(html)
        if actual != expected:
            fails.append(f"title {path}\n    esperado: {expected}\n    actual:   {actual}")

    # --- 2. Metadatos y OG de la home ---
    status, home = fetch("/")
    if status == 200:
        checks = [
            ("description", meta(home, "name", "description")),
            ("og:title", meta(home, "property", "og:title")),
            ("og:description", meta(home, "property", "og:description")),
            ("og:image", meta(home, "property", "og:image")),
        ]
        for name, val in checks:
            if not val:
                fails.append(f"{name} ausente en la home")
            elif len(val) < 40 and name != "og:image":
                fails.append(f"{name} sospechosamente corto ({len(val)} chars)")
        og_w = meta(home, "property", "og:image:width")
        og_h = meta(home, "property", "og:image:height")
        if og_w != "1200" or og_h != "630":
            fails.append(f"og:image declara {og_w}x{og_h} (deberia ser 1200x630)")
        can = re.search(r'<link[^>]*rel="canonical"[^>]*href="([^"]*)"', home, re.I)
        can = can.group(1) if can else None
        if can is None:
            fails.append("canonical ausente")
        elif can.rstrip("/") != EXPECTED_CANONICAL:
            fails.append(f"canonical = {can} (deberia ser {EXPECTED_CANONICAL})")
    else:
        fails.append(f"home inaccesible: HTTP {status}")

    # --- 3. Frases prohibidas (deriva de posicionamiento / marca) ---
    for path in ("/", "/about", "/blog", "/resources"):
        _, html = fetch(path)
        for phrase in FORBIDDEN:
            if phrase.lower() in html.lower():
                fails.append(f"'{phrase}' reaparecio en {path}")

    # --- 4. Sitemap: cobertura de blog y eventos ---
    status, sm = fetch("/sitemap.xml")
    if status != 200:
        fails.append(f"sitemap HTTP {status}")
    else:
        urls = re.findall(r"<loc>([^<]+)</loc>", sm)
        n = len(urls)
        if n < MIN_SITEMAP_URLS:
            fails.append(f"sitemap con {n} URLs (minimo {MIN_SITEMAP_URLS}) - "
                         f"volvio a quedar horneado sin DB?")
        blog = sum(1 for u in urls if "/blog/" in u)
        if blog < MIN_BLOG_POSTS_IN_SITEMAP:
            fails.append(f"sitemap con {blog} posts de blog (minimo "
                         f"{MIN_BLOG_POSTS_IN_SITEMAP})")
        doms = {re.match(r"https://([^/]+)", u).group(1) for u in urls if u.startswith("http")}
        if doms != {"www.vivaresource.com"}:
            fails.append(f"sitemap apunta a dominios ajenos: {sorted(doms)}")
        notes.append(f"sitemap: {n} URLs ({blog} blog)")

    # --- 5. Rutas que deben resolver (redirects sanos) ---
    for path in MUST_RESOLVE:
        status, _ = fetch(path)
        if status != 200:
            fails.append(f"{path}: HTTP {status} (debe resolver 200)")

    # --- 6. robots.txt ---
    status, rb = fetch("/robots.txt")
    if status != 200:
        fails.append(f"robots.txt HTTP {status}")
    else:
        if "Disallow: /$" in rb or re.search(r"^Disallow: /$", rb, re.M):
            fails.append("robots.txt bloquea el sitio completo")
        if EXPECTED_CANONICAL not in rb:
            fails.append("robots.txt no declara el sitemap del dominio real")

    # --- Reporte ---
    if verbose:
        print("Viva SEO Monitor")
        print("=" * 50)
        for n in notes:
            print("  " + n)
        if fails:
            print(f"\n  {len(fails)} DESVIO(S):")
            for f in fails:
                print("  - " + f)
        else:
            print("\n  Todo OK")
        return 0

    if fails:
        print(f"Viva SEO: {len(fails)} desvio(s) detectado(s)\n")
        for f in fails[:12]:
            print("  - " + f)
        if len(fails) > 12:
            print(f"  ... y {len(fails) - 12} mas")
        print("\nRevisar: https://www.vivaresource.com")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
