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
  empty: boolean;
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

export interface QueryRef {
  get: () => Promise<QuerySnapshot>;
}

export interface ColRef {
  __name: string;
  add: (data: any) => Promise<{ id: string }>;
  doc: (id: string) => DocRef;
  get: () => Promise<QuerySnapshot>;
  where: (field: string, op: string, value: any) => WhereQuery;
}

// --- Implementación ---

function toSnapshot(docs: any[]): QuerySnapshot {
  const snapshots: DocumentSnapshot[] = docs.map((d: any) => ({
    id: d.id,
    exists: true,
    data: () => d,
  }));
  return {
    size: snapshots.length,
    empty: snapshots.length === 0,
    docs: snapshots,
    forEach: (fn: (doc: DocumentSnapshot) => void) => snapshots.forEach(fn),
  };
}

function createQueryRef(
  collection: string,
  opts: {
    whereField?: string;
    whereOp?: string;
    whereValue?: string;
    orderBy?: string;
    orderDir?: string;
    limit?: number;
  }
): QueryRef {
  return {
    get: async () => {
      const params = new URLSearchParams();
      if (opts.whereField !== undefined && opts.whereValue !== undefined) {
        params.set("whereField", opts.whereField);
        params.set("whereOp", opts.whereOp || "==");
        params.set("whereValue", opts.whereValue);
      }
      if (opts.orderBy) {
        params.set("orderBy", opts.orderBy);
        params.set("orderDir", opts.orderDir || "desc");
      }
      if (opts.limit != null) {
        params.set("limit", String(opts.limit));
      }
      const qs = params.toString();
      const docs = await request<any[]>(`/${collection}${qs ? `?${qs}` : ""}`);
      return toSnapshot(docs);
    },
  };
}

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
    __name: collection,
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
      return toSnapshot(docs);
    },
    where: (field: string, op: string, value: any) => ({
      get: async () => {
        const docs = await request<any[]>(
          `/${collection}?whereField=${field}&whereOp=${encodeURIComponent(op)}&whereValue=${encodeURIComponent(String(value))}`
        );
        return toSnapshot(docs);
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

export async function getDocs(ref: ColRef | WhereQuery | QueryRef): Promise<QuerySnapshot> {
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
  ref: ColRef | WhereQuery | QueryRef
): Promise<{ data: () => { count: number } }> {
  const snap = await ref.get();
  return { data: () => ({ count: snap.size }) };
}

// onSnapshot - polling fallback (no real-time, but compatible)
export function onSnapshot(
  ref: ColRef | WhereQuery | QueryRef | DocRef,
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
): QueryRef {
  // El ref de colección con nombre se extrae desde createColRef; para propagar
  // filters, capturamos el nombre de la colección y construimos un QueryRef.
  const name = (ref as any).__name as string;
  let whereField: string | undefined;
  let whereOp: string | undefined;
  let whereValue: string | undefined;
  let orderByField: string | undefined;
  let orderDir: string | undefined;
  let lim: number | undefined;

  for (const f of filters) {
    if (f && typeof f === "object") {
      if ("field" in f && "op" in f && "value" in f) {
        whereField = f.field;
        whereOp = f.op;
        whereValue = String(f.value);
      } else if ("field" in f && "direction" in f) {
        orderByField = f.field;
        orderDir = f.direction || "desc";
      } else if ("limit" in f) {
        lim = f.limit;
      }
    }
  }

  return createQueryRef(name, {
    whereField,
    whereOp,
    whereValue,
    orderBy: orderByField,
    orderDir,
    limit: lim,
  });
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
