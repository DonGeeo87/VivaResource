#!/usr/bin/env python3
"""Migrate Firestore collections to PostgreSQL using psql with temp files."""

import json, base64, urllib.request, subprocess, os, sys, time, ssl, tempfile

FIREBASE_ADMIN_KEY = os.environ.get('FIREBASE_ADMIN_KEY', '')
if not FIREBASE_ADMIN_KEY:
    FIREBASE_ADMIN_KEY = subprocess.run(
        ['docker', 'exec', 'viva-migracion', 'sh', '-c', 'echo $FIREBASE_ADMIN_KEY'],
        capture_output=True, text=True).stdout.strip()
    os.environ['PGPASSWORD'] = subprocess.run(
        ['docker', 'exec', 'viva-migracion', 'sh', '-c', 'echo $PGPASSWORD'],
        capture_output=True, text=True).stdout.strip()

sa = json.loads(base64.b64decode(FIREBASE_ADMIN_KEY).decode())
PROJECT_ID = sa['project_id']
BASE = f'https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents'

# Get OAuth token
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend

key = serialization.load_pem_private_key(
    sa['private_key'].encode(), password=None, backend=default_backend())
header = base64.urlsafe_b64encode(
    json.dumps({'alg': 'RS256', 'typ': 'JWT'}).encode()).rstrip(b'=').decode()
now = int(time.time())
claim = base64.urlsafe_b64encode(json.dumps({
    'iss': sa['client_email'],
    'scope': 'https://www.googleapis.com/auth/datastore',
    'aud': 'https://oauth2.googleapis.com/token',
    'exp': now + 3600, 'iat': now
}).encode()).rstrip(b'=').decode()
payload = f'{header}.{claim}'.encode()
sig = key.sign(payload, padding.PKCS1v15(), hashes.SHA256())
sig_b64 = base64.urlsafe_b64encode(sig).rstrip(b'=').decode()
jwt = f'{header}.{claim}.{sig_b64}'

req = urllib.request.Request(
    'https://oauth2.googleapis.com/token',
    data=urllib.parse.urlencode({
        'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion': jwt
    }).encode(),
    headers={'Content-Type': 'application/x-www-form-urlencoded'}
)
token = json.loads(urllib.request.urlopen(
    req, context=ssl.create_default_context()).read())['access_token']
print('Token OK')

# List collections
req = urllib.request.Request(
    f'{BASE}:listCollectionIds', data=b'{}',
    headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'})
cols = json.loads(urllib.request.urlopen(
    req, context=ssl.create_default_context()).read()).get('collectionIds', [])
print(f'Collections: {cols}')

def from_val(v):
    if v is None:
        return None
    for k in ['stringValue', 'integerValue', 'doubleValue', 'booleanValue', 'timestampValue']:
        if k in v:
            return v[k]
    if 'nullValue' in v:
        return None
    if 'arrayValue' in v:
        return [from_val(x) for x in v['arrayValue'].get('values', [])]
    if 'mapValue' in v:
        return {k: from_val(f) for k, f in v['mapValue'].get('fields', {}).items()}
    return str(v)

total = 0
errors = 0

for col in cols:
    print(f'Migrating {col}...', end=' ')
    data = json.loads(urllib.request.urlopen(
        urllib.request.Request(f'{BASE}/{col}?pageSize=500',
        headers={'Authorization': f'Bearer {token}'}),
        context=ssl.create_default_context()).read())
    docs = [(d['name'].split('/')[-1],
             {k: from_val(v) for k, v in d.get('fields', {}).items()})
            for d in data.get('documents', [])]
    print(f'{len(docs)} docs')

    # Write all rows as a single SQL file with dollar-quoted strings
    sql_lines = []
    for doc_id, doc_data in docs:
        data_json = json.dumps(doc_data, ensure_ascii=False)
        # Use dollar-quoted string $JSON$...$JSON$ to avoid any escape issues
        sql_lines.append(
            f"INSERT INTO collections (id, name, data) VALUES "
            f"('{doc_id.replace(chr(39), chr(39)+chr(39))}', "
            f"'{col.replace(chr(39), chr(39)+chr(39))}', "
            f"$JSON${data_json}$JSON$::jsonb) "
            f"ON CONFLICT (name, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();"
        )

    sql_content = '\n'.join(sql_lines)

    # Write to temp file and copy to container
    with tempfile.NamedTemporaryFile(mode='w', suffix='.sql', delete=False) as f:
        f.write(sql_content)
        tmp_path = f.name

    try:
        subprocess.run(
            ['docker', 'cp', tmp_path, 'viva-migracion-db:/tmp/migrate_batch.sql'],
            check=True, capture_output=True, timeout=30)
        r = subprocess.run(
            ['docker', 'exec', 'viva-migracion-db', 'psql', '-U', 'vivaresource',
             '-d', 'vivaresource_blog', '-f', '/tmp/migrate_batch.sql'],
            capture_output=True, text=True, timeout=120)
        if r.returncode == 0:
            total += len(docs)
            print(f'  OK ({len(docs)})')
        else:
            # Individual fallback
            print(f'  Batch failed, trying individually...')
            ok = 0
            for doc_id, doc_data in docs:
                data_json = json.dumps(doc_data, ensure_ascii=False)
                with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f2:
                    f2.write(data_json)
                    json_path = f2.name
                subprocess.run(['docker', 'cp', json_path,
                                'viva-migracion-db:/tmp/row.json'], check=True, timeout=10)
                r2 = subprocess.run(
                    ['docker', 'exec', 'viva-migracion-db', 'psql', '-U', 'vivaresource',
                     '-d', 'vivaresource_blog',
                     '-c', f"INSERT INTO collections (id, name, data) VALUES ('{doc_id.replace(chr(39), chr(39)+chr(39))}', '{col.replace(chr(39), chr(39)+chr(39))}', (SELECT convert_from(pg_read_binary_file('/tmp/row.json'), 'UTF8')::jsonb)) ON CONFLICT (name, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()"],
                    capture_output=True, text=True, timeout=30)
                if r2.returncode == 0:
                    ok += 1
                else:
                    errors += 1
                    print(f'    Error: {doc_id}')
                os.unlink(json_path)
            total += ok
            print(f'  {ok}/{len(docs)} inserted')
    finally:
        os.unlink(tmp_path)

print(f'\nDone: {total} documents, {errors} errors')
