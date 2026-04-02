"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Shield } from "lucide-react";
import { collection, getDocs, doc, setDoc, deleteDoc, Timestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  createdAt: Timestamp | Date;
}

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
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as AdminUser[];
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
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
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
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-700",
      editor: "bg-blue-100 text-blue-700",
      viewer: "bg-gray-100 text-gray-700",
    };
    return colors[role] || colors.viewer;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div><div className="h-8 w-48 bg-gray-200 rounded mb-2" /><div className="h-4 w-64 bg-gray-200 rounded" /></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-4">
              <div className="h-4 w-48 bg-gray-200 rounded" />
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === "es" ? "Usuarios Admin" : "Admin Users"}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === "es" ? "Gestiona los usuarios con acceso al panel" : "Manage users with dashboard access"}
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors">
          <Plus className="w-5 h-5" />
          {language === "es" ? "Agregar Usuario" : "Add User"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === "es" ? "Rol" : "Role"}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === "es" ? "Fecha" : "Date"}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{language === "es" ? "Acciones" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                {language === "es" ? "No hay usuarios admin" : "No admin users"}
              </td></tr>
            ) : users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{user.email}</span>
                      <p className="text-xs text-gray-400">{user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadge(user.role)}`}>{user.role}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.createdAt instanceof Timestamp
                    ? user.createdAt.toDate().toLocaleDateString(language === "es" ? "es-ES" : "en-US")
                    : new Date(user.createdAt).toLocaleDateString(language === "es" ? "es-ES" : "en-US")}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingUser(user)} className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100" title={language === "es" ? "Editar rol" : "Edit role"}>
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100" title={language === "es" ? "Eliminar" : "Delete"}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{language === "es" ? "Agregar Usuario" : "Add User"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UID</label>
                <input type="text" value={newUid} onChange={e => setNewUid(e.target.value)} placeholder="Firebase Auth UID" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="user@example.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{language === "es" ? "Rol" : "Role"}</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value as "admin" | "editor" | "viewer")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">{language === "es" ? "Cancelar" : "Cancel"}</button>
              <button onClick={handleAddUser} disabled={!newUid || !newEmail} className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50">{language === "es" ? "Agregar" : "Add"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{language === "es" ? "Editar Rol" : "Edit Role"}</h2>
            <p className="text-gray-600 mb-4">{editingUser.email}</p>
            <div className="flex gap-2">
              {(["admin", "editor", "viewer"] as const).map(role => (
                <button key={role} onClick={() => handleUpdateRole(editingUser.id, role)} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${editingUser.role === role ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{role}</button>
              ))}
            </div>
            <button onClick={() => setEditingUser(null)} className="w-full mt-4 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">{language === "es" ? "Cerrar" : "Close"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
