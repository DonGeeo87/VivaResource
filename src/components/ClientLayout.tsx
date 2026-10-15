"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RecaptchaProvider from "@/contexts/RecaptchaProvider";
import { CookieProvider } from "@/contexts/CookieContext";
import CookieBanner from "@/components/CookieBanner";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps): JSX.Element {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isVolunteerPortal = pathname === "/volunteer-portal" || pathname.startsWith("/volunteer-portal/");

  const content = (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* El landmark <main> lo aporta cada pagina; aca solo va el contenedor
          que apunta el skip-link, para no duplicar <main> en el documento. */}
      <div id="main-content" tabIndex={-1} className="flex-1">{children}</div>
      <Footer />
      <CookieBanner />
    </div>
  );

  if (isAdminRoute || isVolunteerPortal) {
    return (
      <RecaptchaProvider>
        <CookieProvider>{children}</CookieProvider>
      </RecaptchaProvider>
    );
  }

  return (
    <RecaptchaProvider>
      <CookieProvider>
        {content}
      </CookieProvider>
    </RecaptchaProvider>
  );
}
