/**
 * Cliente DB que reemplaza Firebase Firestore en el frontend.
 * Imita la API de Firestore (collection, doc, getDocs, addDoc, etc.)
 * pero llama a nuestra API route /api/db/[collection]
 */

const API_BASE = "/api/db";

async function request<T = any>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// --- Tipos compatibles con Firestore ---

export interface DocumentSnapshot {
  id: string;
  exists: boolean;
  data: () => Record<string, any> | null;
}

export interface QuerySnapshot {
  size: number;
  docs: DocumentSnapshot[];
  forEach: (fn: (doc: DocumentSnapshot) => void) => void;
}

export interface DocRef {
  get: () => Promise<DocumentSnapshot>;
  set: (data: any, options?: { merge?: boolean }) => Promise<void>;
  update: (data: any) => Promise<void>;
  delete: () => Promise<void>;
}

export interface WhereQuery {
  get: () => Promise<QuerySnapshot>;
}

export interface ColRef {
  add: (data: any) => Promise<{ id: string }>;
  doc: (id: string) => DocRef;
  get: () => Promise<QuerySnapshot>;
  where: (field: string, op: string, value: any) => WhereQuery;
}

// --- Implementación ---

function createDocRef(collection: string, id: string): DocRef {
  return {
    get: async () => {
      try {
        const data = await request<any>(`/${collection}?id=${id}`);
        return {
          id: data.id,
          exists: true,
          data: () => data,
        };
      } catch {
        return { id, exists: false, data: () => null };
      }
    },
    set: async (data: any, options?: { merge?: boolean }) => {
      await request(`/${collection}`, {
        method: "PUT",
        body: JSON.stringify({ id, ...data }),
      });
    },
    update: async (data: any) => {
      await request(`/${collection}`, {
        method: "PUT",
        body: JSON.stringify({ id, ...data }),
      });
    },
    delete: async () => {
      await request(`/${collection}?id=${id}`, { method: "DELETE" });
    },
  };
}

function createColRef(collection: string): ColRef {
  return {
    add: async (data: any) => {
      const result = await request<{ id: string }>(`/${collection}`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return { id: result.id };
    },
    doc: (id: string) => createDocRef(collection, id),
    get: async () => {
      const docs = await request<any[]>(`/${collection}`);
      const snapshots = docs.map((d: any) => ({
        id: d.id,
        exists: true,
        data: () => d,
      }));
      return {
        size: snapshots.length,
        docs: snapshots,
        forEach: (fn: (doc: DocumentSnapshot) => void) =>
          snapshots.forEach(fn),
      };
    },
    where: (field: string, op: string, value: any) => ({
      get: async () => {
        const docs = await request<any[]>(
          `/${collection}?whereField=${field}&whereOp=${encodeURIComponent(op)}&whereValue=${encodeURIComponent(String(value))}`
        );
        const snapshots = docs.map((d: any) => ({
          id: d.id,
          exists: true,
          data: () => d,
        }));
        return {
          size: snapshots.length,
          docs: snapshots,
          forEach: (fn: (doc: DocumentSnapshot) => void) =>
            snapshots.forEach(fn),
        };
      },
    }),
  };
}

// --- Objeto db principal (reemplaza el de firebase/firestore) ---
export const db = {
  collection: (name: string): ColRef => createColRef(name),
};

// --- Funciones helper compatibles con Firestore ---
export function collection(db: any, path: string): ColRef {
  return createColRef(path);
}

export function doc(db: any, path: string, ...segments: string[]): DocRef {
  const id = segments.join("/");
  return createDocRef(path, id);
}

export async function getDocs(ref: ColRef | WhereQuery): Promise<QuerySnapshot> {
  return ref.get();
}

export async function getDoc(ref: DocRef): Promise<DocumentSnapshot> {
  return ref.get();
}

export async function addDoc(
  ref: ColRef,
  data: any
): Promise<{ id: string }> {
  return ref.add(data);
}

export async function setDoc(
  ref: DocRef,
  data: any,
  options?: { merge?: boolean }
): Promise<void> {
  return ref.set(data, options);
}

export async function updateDoc(ref: DocRef, data: any): Promise<void> {
  return ref.update(data);
}

export async function deleteDoc(ref: DocRef): Promise<void> {
  return ref.delete();
}

export async function deleteField() {
  return { __deleteField: true };
}

// --- Timestamp (compatible con Firestore) ---
export class Timestamp {
  constructor(
    public seconds: number,
    public nanoseconds: number
  ) {}

  toDate(): Date {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1e6);
  }

  toMillis(): number {
    return this.seconds * 1000 + this.nanoseconds / 1e6;
  }

  static now(): Timestamp {
    const now = Date.now();
    return new Timestamp(Math.floor(now / 1000), (now % 1000) * 1e6);
  }

  static fromDate(date: Date): Timestamp {
    return new Timestamp(
      Math.floor(date.getTime() / 1000),
      (date.getTime() % 1000) * 1e6
    );
  }
}

export function serverTimestamp() {
  return Timestamp.now();
}

export async function getCountFromServer(
  ref: ColRef | WhereQuery
): Promise<{ data: () => { count: number } }> {
  const snap = await ref.get();
  return { data: () => ({ count: snap.size }) };
}

// onSnapshot - polling fallback (no real-time, but compatible)
export function onSnapshot(
  ref: ColRef | WhereQuery | DocRef,
  callback: (snap: any) => void
): () => void {
  // Immediate first call
  ref.get().then(callback).catch(() => {});
  // Poll every 5 seconds
  const interval = setInterval(() => {
    ref.get().then(callback).catch(() => {});
  }, 5000);
  return () => clearInterval(interval);
}

// writeBatch - stub compatible
export function writeBatch() {
  let ops: any[] = [];
  return {
    set: (ref: DocRef, data: any) => { ops.push({ type: "set", ref, data }); },
    update: (ref: DocRef, data: any) => { ops.push({ type: "update", ref, data }); },
    delete: (ref: DocRef) => { ops.push({ type: "delete", ref }); },
    commit: async () => {
      for (const op of ops) {
        try {
          if (op.type === "set") await op.ref.set(op.data);
          else if (op.type === "update") await op.ref.update(op.data);
          else if (op.type === "delete") await op.ref.delete();
        } catch (e) { console.error("Batch op failed:", e); }
      }
    }
  };
}

export function query(
  ref: ColRef,
  ...filters: any[]
): ColRef {
  return ref; // Simplificación: ignoramos filters por ahora
}

export function where(
  field: string,
  op: string,
  value: any
): { field: string; op: string; value: any } {
  return { field, op, value };
}

export function orderBy(
  field: string,
  direction?: "asc" | "desc"
): { field: string; direction: string } {
  return { field, direction: direction || "asc" };
}

export function limit(n: number): { limit: number } {
  return { limit: n };
}
