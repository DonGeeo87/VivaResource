"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  PageShell,
  PageHeader,
  Card,
  StatusBadge,
  Modal,
  AdminButton,
  Field,
  Input,
  Select,
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  TableEmpty,
  TableSkeleton,
} from "@/components/admin";
import type { BadgeTone } from "@/components/admin";

import { db, Timestamp, collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from "@/lib/db-client";

interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  createdAt: Timestamp | Date;
}

const ROLE_TONES: Record<string, BadgeTone> = {
  admin: "brand",
  editor: "info",
  viewer: "neutral",
};

export default function AdminUsersPage(): JSX.Element {
  const { language } = useLanguage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "editor" | "viewer">("editor");
  const [newUid, setNewUid] = useState("");

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "admin_users"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminUser[];
      setUsers(data);
    } catch (error) {
      console.error("Error fetching admin users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUid || !newEmail) return;
    try {
      await setDoc(doc(db, "admin_users", newUid), {
        email: newEmail,
        role: newRole,
        createdAt: Timestamp.now(),
      });
      setShowAddModal(false);
      setNewUid("");
      setNewEmail("");
      setNewRole("editor");
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleUpdateRole = async (userId: string, role: "admin" | "editor" | "viewer") => {
    try {
      await setDoc(doc(db, "admin_users", userId), { role }, { merge: true });
      setUsers(users.map((u) => (u.id === userId ? { ...u, role } : u)));
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmMsg = language === "es"
      ? "¿Estás seguro de eliminar este usuario?"
      : "Are you sure you want to delete this user?";
    if (!confirm(confirmMsg)) return;
    try {
      await deleteDoc(doc(db, "admin_users", userId));
      setUsers(users.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const formatDate = (createdAt: Timestamp | Date) =>
    createdAt instanceof Timestamp
      ? createdAt.toDate().toLocaleDateString(language === "es" ? "es-ES" : "en-US")
      : new Date(createdAt).toLocaleDateString(language === "es" ? "es-ES" : "en-US");

  return (
    <PageShell>
      <PageHeader
        title={language === "es" ? "Usuarios Admin" : "Admin Users"}
        description={language === "es" ? "Gestiona los usuarios con acceso al panel" : "Manage users with dashboard access"}
        actions={
          <AdminButton icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            {language === "es" ? "Agregar Usuario" : "Add User"}
          </AdminButton>
        }
      />

      <Card>
        <Table>
          <Thead>
            <Th>Email</Th>
            <Th>{language === "es" ? "Rol" : "Role"}</Th>
            <Th>{language === "es" ? "Fecha" : "Date"}</Th>
            <Th align="right">{language === "es" ? "Acciones" : "Actions"}</Th>
          </Thead>
          <Tbody>
            {loading ? (
              <TableSkeleton rows={3} cols={4} />
            ) : users.length === 0 ? (
              <TableEmpty colSpan={4}>{language === "es" ? "No hay usuarios admin" : "No admin users"}</TableEmpty>
            ) : (
              users.map((user) => (
                <Tr key={user.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-on-surface">{user.email}</span>
                        <span className="block text-xs text-outline truncate">{user.id}</span>
                      </div>
                    </div>
                  </Td>
                  <Td><StatusBadge tone={ROLE_TONES[user.role] || "neutral"}>{user.role}</StatusBadge></Td>
                  <Td>{formatDate(user.createdAt)}</Td>
                  <Td align="right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setEditingUser(user)} title={language === "es" ? "Editar rol" : "Edit role"} className="p-2 text-on-surface-variant hover:text-primary rounded-md hover:bg-surface-low">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)} title={language === "es" ? "Eliminar" : "Delete"} className="p-2 text-on-surface-variant hover:text-red-600 rounded-md hover:bg-surface-low">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>

      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={language === "es" ? "Agregar Usuario" : "Add User"}
        footer={
          <>
            <AdminButton variant="secondary" onClick={() => setShowAddModal(false)}>{language === "es" ? "Cancelar" : "Cancel"}</AdminButton>
            <AdminButton onClick={handleAddUser} disabled={!newUid || !newEmail}>{language === "es" ? "Agregar" : "Add"}</AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="UID" htmlFor="new-uid" required helper="Firebase Auth UID del usuario.">
            <Input id="new-uid" value={newUid} onChange={(e) => setNewUid(e.target.value)} placeholder="Firebase Auth UID" />
          </Field>
          <Field label="Email" htmlFor="new-email" required>
            <Input id="new-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@example.com" />
          </Field>
          <Field label={language === "es" ? "Rol" : "Role"} htmlFor="new-role">
            <Select id="new-role" value={newRole} onChange={(e) => setNewRole(e.target.value as "admin" | "editor" | "viewer")}>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </Select>
          </Field>
        </div>
      </Modal>

      <Modal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={language === "es" ? "Editar Rol" : "Edit Role"}
        size="sm"
        footer={<AdminButton variant="secondary" fullWidth onClick={() => setEditingUser(null)}>{language === "es" ? "Cerrar" : "Close"}</AdminButton>}
      >
        <p className="text-sm text-on-surface-variant mb-4">{editingUser?.email}</p>
        <div className="flex gap-2">
          {(["admin", "editor", "viewer"] as const).map((role) => (
            <button
              key={role}
              onClick={() => editingUser && handleUpdateRole(editingUser.id, role)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium border capitalize transition-colors ${
                editingUser?.role === role
                  ? "bg-primary text-white border-primary"
                  : "bg-surface-lowest text-on-surface-variant border-outline-low hover:bg-surface-low"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </Modal>
    </PageShell>
  );
}
