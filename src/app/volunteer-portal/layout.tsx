"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AdminAuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function VolunteerPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <Header />
      <main id="main-content" className="pt-0">
        {children}
      </main>
      <Footer />
    </AuthProvider>
  );
}
