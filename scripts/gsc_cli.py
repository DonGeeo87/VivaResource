#!/usr/bin/env python3
"""
Google Search Console CLI helper for Viva Resource.

Usage:
  python scripts/gsc_cli.py inspect https://www.vivaresource.com/
  python scripts/gsc_cli.py list
  python scripts/gsc_cli.py sitemap-status

Prerequisites:
  pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
  Place your OAuth2 client_secret.json in scripts/client_secret.json
"""

import argparse
import json
import os
import sys
from pathlib import Path

try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from google.auth.transport.requests import Request
except ImportError:
    print("Google libraries not installed. Run:")
    print("  pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")
    sys.exit(1)

# ── Config ────────────────────────────────────────────────────────────
SCOPES = ["https://www.googleapis.com/auth/webmasters"]
SCRIPT_DIR = Path(__file__).parent
CLIENT_SECRET_FILE = SCRIPT_DIR / "client_secret.json"
TOKEN_FILE = SCRIPT_DIR / "token.json"

# Your verified site URL in Search Console (must match exactly)
SITE_URL = "https://www.vivaresource.com/"


def get_service():
    """Authenticate and return Search Console API service."""
    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CLIENT_SECRET_FILE.exists():
                print(f"ERROR: {CLIENT_SECRET_FILE} not found.")
                print("Download it from Google Cloud Console → APIs & Services → Credentials")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRET_FILE), SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, "w") as token:
            token.write(creds.to_json())

    return build("webmasters", "v3", credentials=creds)


def cmd_inspect(url: str):
    """Request indexing (URL Inspection + submit for indexing)."""
    service = get_service()
    print(f"Inspecting: {url}")

    # URL Inspection
    try:
        result = service.urlInspection().index().inspect(
            body={
                "inspectionUrl": url,
                "siteUrl": SITE_URL,
                "languageCode": "en"
            }
        ).execute()
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Inspection error: {e}")

    # Note: The API itself does not directly submit for indexing.
    # You must use the Search Console UI or the new Indexing API (limited).
    print("\nTip: For re-indexing, use the Search Console UI directly:")
    print(f"  https://search.google.com/search-console?resource_id={SITE_URL}")


def cmd_list():
    """List all sites/properties in your Search Console account."""
    service = get_service()
    sites = service.sites().list().execute()
    print("Sites in your Search Console account:")
    for site in sites.get("siteEntry", []):
        print(f"  - {site['siteUrl']} (permission: {site.get('permissionLevel', 'unknown')})")


def cmd_sitemap_status():
    """Show submitted sitemaps and their status."""
    service = get_service()
    sitemaps = service.sitemaps().list(siteUrl=SITE_URL).execute()
    print(f"Sitemaps for {SITE_URL}:")
    for sm in sitemaps.get("sitemap", []):
        print(f"  - {sm['path']}")
        print(f"    last submitted: {sm.get('lastSubmitted', 'N/A')}")
        print(f"    last download:  {sm.get('lastDownloaded', 'N/A')}")
        print(f"    status:         {sm.get('errors', 0)} errors, {sm.get('warnings', 0)} warnings")


def cmd_performance(days: int = 28):
    """Show search performance (clicks, impressions, CTR, position)."""
    from datetime import datetime, timedelta

    service = get_service()
    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

    request_body = {
        "startDate": start_date,
        "endDate": end_date,
        "dimensions": ["query"],
        "rowLimit": 10,
    }

    response = service.searchanalytics().query(siteUrl=SITE_URL, body=request_body).execute()
    rows = response.get("rows", [])
    if not rows:
        print("No data found for this period.")
        return

    print(f"Top queries (last {days} days):")
    print(f"{'Query':<40} {'Clicks':>8} {'Impressions':>12} {'CTR':>8} {'Position':>8}")
    print("-" * 80)
    for row in rows:
        query = row["keys"][0]
        clicks = row["clicks"]
        impressions = row["impressions"]
        ctr = row["ctr"] * 100
        position = row["position"]
        print(f"{query:<40} {clicks:>8} {impressions:>12} {ctr:>7.1f}% {position:>7.1f}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Google Search Console CLI for Viva Resource")
    sub = parser.add_subparsers(dest="command")

    p_inspect = sub.add_parser("inspect", help="Inspect a URL")
    p_inspect.add_argument("url", help="Full URL to inspect")

    sub.add_parser("list", help="List Search Console properties")
    sub.add_parser("sitemap-status", help="Show sitemap status")

    p_perf = sub.add_parser("performance", help="Show search performance")
    p_perf.add_argument("--days", type=int, default=28, help="Number of days (default: 28)")

    args = parser.parse_args()

    if args.command == "inspect":
        cmd_inspect(args.url)
    elif args.command == "list":
        cmd_list()
    elif args.command == "sitemap-status":
        cmd_sitemap_status()
    elif args.command == "performance":
        cmd_performance(args.days)
    else:
        parser.print_help()
