import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch for db-client tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
  localStorage.clear();
});

// ============================================================
// db-client.ts — Firestore-compatible client
// ============================================================
describe('db-client', () => {
  it('should export db.collection().add()', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new-id' }),
    });

    const { db } = await import('@/lib/db-client');
    const result = await db.collection('test').add({ name: 'test' });

    expect(result.id).toBe('new-id');
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/db/test',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('test'),
      })
    );
  });

  it('should export db.collection().get()', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([{ id: '1', name: 'test' }]),
    });

    const { db } = await import('@/lib/db-client');
    const snapshot = await db.collection('test').get();

    expect(snapshot.size).toBe(1);
    expect(snapshot.docs[0].id).toBe('1');
  });

  it('should export db.collection().doc().get()', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', name: 'test' }),
    });

    const { db } = await import('@/lib/db-client');
    const doc = await db.collection('test').doc('1').get();

    expect(doc.exists).toBe(true);
    expect(doc.data()?.name).toBe('test');
  });

  it('should export db.collection().doc().set()', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    const { db } = await import('@/lib/db-client');
    await db.collection('test').doc('1').set({ name: 'updated' });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/db/test',
      expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('updated'),
      })
    );
  });

  it('should export db.collection().doc().delete()', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

    const { db } = await import('@/lib/db-client');
    await db.collection('test').doc('1').delete();

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/db/test?id=1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('should export db.collection().where().get()', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([{ id: '1', name: 'test', status: 'active' }]),
    });

    const { db } = await import('@/lib/db-client');
    const snapshot = await db.collection('test')
      .where('status', '==', 'active')
      .get();

    expect(snapshot.size).toBe(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('wheres='),
      expect.any(Object)
    );
  });

  it('should export helper functions (collection, doc, getDocs, addDoc)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new-id' }),
    });

    const { collection, addDoc, getDocs, doc, getDoc, deleteDoc, setDoc, updateDoc } = await import('@/lib/db-client');

    // addDoc
    const ref = collection(null, 'test');
    const result = await addDoc(ref, { name: 'test' });
    expect(result.id).toBe('new-id');

    // getDocs
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ([]) });
    const snap = await getDocs(ref);
    expect(snap.size).toBe(0);

    // doc + getDoc
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: '1' }) });
    const docRef = doc(null, 'test', '1');
    const docSnap = await getDoc(docRef);
    expect(docSnap.exists).toBe(true);

    // setDoc
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await setDoc(docRef, { name: 'x' });

    // updateDoc
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await updateDoc(docRef, { name: 'y' });

    // deleteDoc
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    await deleteDoc(docRef);
  });

  it('should export Timestamp', async () => {
    const { Timestamp } = await import('@/lib/db-client');
    const ts = Timestamp.now();
    expect(ts.seconds).toBeGreaterThan(0);
    expect(ts.toDate()).toBeInstanceOf(Date);
    expect(ts.toMillis()).toBeGreaterThan(0);
  });

  it('should export serverTimestamp', async () => {
    const { serverTimestamp } = await import('@/lib/db-client');
    const ts = serverTimestamp();
    expect(ts.seconds).toBeGreaterThan(0);
  });

  it('should export onSnapshot (polling fallback)', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ([]) });

    const { onSnapshot, db } = await import('@/lib/db-client');
    const callback = vi.fn();
    const ref = db.collection('test');
    const unsubscribe = onSnapshot(ref, callback);

    // Should call immediately (but mock may not resolve in time)
    expect(unsubscribe).toBeInstanceOf(Function);
    unsubscribe(); // cleanup interval
  });

  it('should export writeBatch', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

    const { writeBatch, db } = await import('@/lib/db-client');
    const batch = writeBatch();
    const ref = db.collection('test').doc('1');

    batch.set(ref, { name: 'a' });
    batch.update(ref, { name: 'b' });
    batch.delete(ref);
    await batch.commit();

    // Should have made 3 calls
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should export getCountFromServer', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([{ id: '1' }, { id: '2' }]),
    });

    const { getCountFromServer, db } = await import('@/lib/db-client');
    const result = await getCountFromServer(db.collection('test'));
    expect(result.data().count).toBe(2);
  });
});

// ============================================================
// Auth client
// ============================================================
describe('auth client', () => {
  it('should login and store session', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'jwt-token',
        user: { uid: '123', email: 'admin@test.com', role: 'admin' },
      }),
    });

    const { loginWithJwt, getToken, getUser } = await import('@/lib/auth/client');
    const result = await loginWithJwt('admin@test.com', 'password');

    expect(result.token).toBe('jwt-token');
    expect(result.user.role).toBe('admin');
    expect(getToken()).toBe('jwt-token');
    expect(getUser()?.email).toBe('admin@test.com');
  });

  it('should handle login failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Credenciales inválidas' }),
    });

    const { loginWithJwt } = await import('@/lib/auth/client');
    await expect(loginWithJwt('bad@test.com', 'wrong'))
      .rejects.toThrow('Credenciales inválidas');
  });

  it('should logout and clear session', async () => {
    localStorage.setItem('viva_admin_token', 'test-token');
    localStorage.setItem('viva_admin_user', JSON.stringify({ uid: '1', email: 'a@b.com', role: 'admin' }));

    const { clearSession, getToken, getUser } = await import('@/lib/auth/client');
    clearSession();

    expect(getToken()).toBeNull();
    expect(getUser()).toBeNull();
  });

  it('should get current user ID', async () => {
    localStorage.setItem('viva_admin_user', JSON.stringify({ uid: 'user-123', email: 'a@b.com', role: 'admin' }));

    const { getCurrentUserId } = await import('@/lib/auth/client');
    expect(getCurrentUserId()).toBe('user-123');
  });

  it('should return null for getCurrentUserId when not logged in', async () => {
    const { getCurrentUserId } = await import('@/lib/auth/client');
    expect(getCurrentUserId()).toBeNull();
  });
});

// ============================================================
// JWT token utilities
// ============================================================
describe('JWT auth', () => {
  it('should sign and verify tokens', async () => {
    const { signToken, verifyToken } = await import('@/lib/auth/jwt');
    const payload = { uid: '123', email: 'test@test.com', role: 'admin' as const, type: 'admin' as const };

    const token = signToken(payload);
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.uid).toBe('123');
    expect(decoded!.email).toBe('test@test.com');
    expect(decoded!.role).toBe('admin');
  });

  it('should reject invalid tokens', async () => {
    const { verifyToken } = await import('@/lib/auth/jwt');
    const result = verifyToken('invalid-token');
    expect(result).toBeNull();
  });

  it('should extract token from Authorization header', async () => {
    const { getTokenFromHeader } = await import('@/lib/auth/jwt');

    const request = new Request('http://test.com', {
      headers: { Authorization: 'Bearer my-token' },
    });
    expect(getTokenFromHeader(request)).toBe('my-token');

    const noAuth = new Request('http://test.com');
    expect(getTokenFromHeader(noAuth)).toBeNull();
  });
});

// ============================================================
// Language context (requires React provider, skip in unit tests)
// ============================================================
describe('LanguageContext', () => {
  it('should have translations defined', async () => {
    const { translations } = await import('@/i18n/translations');
    expect(translations.en).toBeDefined();
    expect(translations.es).toBeDefined();
    expect(translations.en.home).toBeDefined();
    expect(translations.es.home).toBeDefined();
  });
});

// ============================================================
// Timezone utilities
// ============================================================
describe('timezone', () => {
  it('should format Mountain time dates', async () => {
    const { formatMountainDate } = await import('@/lib/timezone');
    const date = new Date('2026-07-26T12:00:00Z');
    const result = formatMountainDate(date, 'en');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});

// ============================================================
// Rate limiting
// ============================================================
describe('rate-limit', () => {
  it('should allow requests within limit', async () => {
    const { checkRateLimit, RATE_LIMITS } = await import('@/lib/rate-limit');
    const result = checkRateLimit('127.0.0.1', RATE_LIMITS.newsletter);
    expect(result.limited).toBe(false);
  });

  it('should get client IP from request', async () => {
    const { getClientIp } = await import('@/lib/rate-limit');
    const request = new Request('http://test.com', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    expect(getClientIp(request)).toBe('1.2.3.4');
  });
});
