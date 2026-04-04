"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  Heart,
  Settings,
  LogOut,
  Menu,
  Mail,
  ClipboardList,
  Sparkles,
  Shield,
  Image,
  HandHelping,
} from "lucide-react";
import { AuthProvider, useAuth } from "@/contexts/AdminAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

function AdminLayoutContent({ children }: { children: ReactNode }): JSX.Element | null {
  const { user, loading, logout } = useAuth();
  const { language } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/blog", label: "Blog", icon: FileText },
    { href: "/admin/events", label: language === "es" ? "Eventos" : "Events", icon: Calendar },
    { href: "/admin/forms", label: language === "es" ? "Formularios" : "Forms", icon: ClipboardList },
    { href: "/admin/volunteers", label: language === "es" ? "Voluntarios" : "Volunteers", icon: Users },
    { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
    { href: "/admin/donations", label: language === "es" ? "Donaciones" : "Donations", icon: Heart },
    { href: "/admin/ai-generator", label: "AI Generator", icon: Sparkles },
    { href: "/admin/users", label: language === "es" ? "Usuarios" : "Users", icon: Shield },
    { href: "/admin/help-requests", label: language === "es" ? "Solicitudes de Ayuda" : "Help Requests", icon: HandHelping },
    { href: "/admin/images", label: language === "es" ? "Imágenes" : "Images", icon: Image },
    { href: "/admin/settings", label: language === "es" ? "Configuración" : "Settings", icon: Settings },
  ];

  // Si estamos en login, NO hacer redirect
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Solo validar si NO estamos en login
    if (!loading && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [loading, user, router, pathname]);

  // Si estamos en login, renderizar solo el contenido
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">{language === "es" ? "Cargando..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        overflow-y-auto
      `}>
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold">Viva Admin</h1>
          <p className="text-sm text-slate-400 truncate">{user.email}</p>
          <span className="inline-block mt-2 px-2 py-1 bg-primary text-xs rounded uppercase">
            {user.role}
          </span>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? "bg-primary text-white" 
                    : "text-slate-300 hover:bg-slate-800"
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>{language === "es" ? "Cerrar Sesión" : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar - Mobile */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 lg:hidden sticky top-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
