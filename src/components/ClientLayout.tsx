"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps): JSX.Element {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isVolunteerPortal = pathname === "/volunteer-portal" || pathname.startsWith("/volunteer-portal/");

  // Para rutas admin y volunteer-portal, NO envolvemos con Header/Footer globales
  // (ellos tienen sus propios layouts)
  if (isAdminRoute || isVolunteerPortal) {
    return <>{children}</>;
  }

  // Para rutas públicas, envolvemos con Header y Footer
  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
