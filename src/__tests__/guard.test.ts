import { describe, it, expect } from 'vitest';
import { authorize, authorizeStaff } from '@/lib/auth/guard';
import { signToken, type JwtPayload } from '@/lib/auth/jwt';

function req(token?: string): Request {
  return new Request('http://localhost/api/db/test', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

const admin = signToken({ uid: '1', email: 'a@b.com', role: 'admin', type: 'admin' });
const editor = signToken({ uid: '2', email: 'e@b.com', role: 'editor', type: 'admin' });
const viewer = signToken({ uid: '3', email: 'v@b.com', role: 'viewer', type: 'admin' });
const volunteer = signToken({ uid: '4', email: 'vol@b.com', role: 'viewer', type: 'volunteer' } as JwtPayload);

function status(verdict: ReturnType<typeof authorize>): number | 'ok' {
  return verdict.ok ? 'ok' : verdict.response.status;
}

describe('guard: lectura (GET)', () => {
  it('permite leer las colecciones que el sitio público usa sin sesión', () => {
    for (const c of ['events', 'forms', 'seo_settings', 'site_images', 'site_settings']) {
      expect(status(authorize(req(), c, 'GET')), c).toBe('ok');
    }
  });

  it('rechaza lectura anónima de admin_users', () => {
    expect(status(authorize(req(), 'admin_users', 'GET'))).toBe(401);
  });

  it('rechaza lectura anónima de datos de inscritos y contenido', () => {
    for (const c of ['event_registrations', 'form_submissions', 'help_requests', 'newsletter_subscribers', 'blog_posts', 'donations']) {
      expect(status(authorize(req(), c, 'GET')), c).toBe(401);
    }
  });

  it('permite lectura con token de admin', () => {
    expect(status(authorize(req(admin), 'admin_users', 'GET'))).toBe('ok');
  });
});

describe('guard: escritura (POST/PUT)', () => {
  it('permite crear desde formularios públicos', () => {
    for (const c of ['event_registrations', 'form_submissions', 'help_requests', 'volunteer_registrations']) {
      expect(status(authorize(req(), c, 'POST')), c).toBe('ok');
    }
  });

  it('rechaza crear contenido de admin sin token', () => {
    for (const c of ['blog_posts', 'events', 'forms', 'seo_settings', 'participants']) {
      expect(status(authorize(req(), c, 'POST')), c).toBe(401);
    }
  });

  it('permite escribir con token editor', () => {
    expect(status(authorize(req(editor), 'blog_posts', 'POST'))).toBe('ok');
    expect(status(authorize(req(editor), 'blog_posts', 'PUT'))).toBe('ok');
  });

  it('viewer no alcanza para escribir (es solo lectura)', () => {
    expect(status(authorize(req(viewer), 'blog_posts', 'POST'))).toBe(403);
  });
});

describe('guard: borrado (DELETE)', () => {
  it('exige token', () => {
    expect(status(authorize(req(), 'participants', 'DELETE'))).toBe(401);
  });

  it('exige rol admin (editor no alcanza)', () => {
    expect(status(authorize(req(editor), 'participants', 'DELETE'))).toBe(403);
  });

  it('permite borrar a un admin', () => {
    expect(status(authorize(req(admin), 'participants', 'DELETE'))).toBe('ok');
  });
});

describe('guard: tokens de voluntario', () => {
  it('no da acceso a colecciones de administración', () => {
    expect(status(authorize(req(volunteer), 'blog_posts', 'GET'))).toBe(403);
    expect(status(authorize(req(volunteer), 'participants', 'DELETE'))).toBe(403);
    expect(status(authorize(req(volunteer), 'participants', 'GET'))).toBe(403);
    expect(status(authorize(req(volunteer), 'help_requests', 'GET'))).toBe(403);
  });

  it('sí accede a sus propias colecciones (tasks / messages)', () => {
    expect(status(authorize(req(volunteer), 'volunteer_tasks', 'GET'))).toBe('ok');
    expect(status(authorize(req(volunteer), 'volunteer_messages', 'GET'))).toBe('ok');
    expect(status(authorize(req(volunteer), 'volunteer_messages', 'POST'))).toBe('ok');
    expect(status(authorize(req(volunteer), 'volunteer_messages', 'PUT'))).toBe('ok');
  });
});

describe('guard: colecciones que ya no son públicas', () => {
  it('participants, volunteer_registrations y volunteer_* exigen sesión', () => {
    expect(status(authorize(req(), 'participants', 'GET'))).toBe(401);
    expect(status(authorize(req(), 'volunteer_registrations', 'GET'))).toBe(401);
    expect(status(authorize(req(), 'volunteer_tasks', 'GET'))).toBe(401);
    expect(status(authorize(req(), 'volunteer_messages', 'PUT'))).toBe(401);
    expect(status(authorize(req(), 'volunteer_messages', 'POST'))).toBe(401);
  });
});

describe('guard: endpoints de staff (correo, upload, IA, publicar plantilla)', () => {
  it('rechaza sin sesión', () => {
    expect(status(authorizeStaff(req()))).toBe(401);
  });

  it('rechaza el token del portal del voluntario', () => {
    expect(status(authorizeStaff(req(volunteer)))).toBe(403);
  });

  it('rechaza viewer: no alcanza para mandar correo ni subir archivos', () => {
    expect(status(authorizeStaff(req(viewer)))).toBe(403);
  });

  it('permite editor y admin', () => {
    expect(status(authorizeStaff(req(editor)))).toBe('ok');
    expect(status(authorizeStaff(req(admin)))).toBe('ok');
  });

  it('para borrar un post exige admin', () => {
    expect(status(authorizeStaff(req(editor), 'admin'))).toBe(403);
    expect(status(authorizeStaff(req(admin), 'admin'))).toBe('ok');
  });
});
