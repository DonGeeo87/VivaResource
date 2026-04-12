"use client";

import { ReactNode } from "react";
import { VolunteerAuthProvider } from "@/contexts/VolunteerAuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function VolunteerPortalClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <VolunteerAuthProvider>
      <Header />
      <main id="main-content" className="pt-0">
        {children}
      </main>
      <Footer />
    </VolunteerAuthProvider>
  );
}
