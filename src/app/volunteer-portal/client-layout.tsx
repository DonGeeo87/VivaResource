"use client";

import { ReactNode } from "react";
import { VolunteerAuthProvider } from "@/contexts/VolunteerAuthContext";

export default function VolunteerPortalClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  // No Header/Footer - volunteer portal has its own navigation
  return (
    <VolunteerAuthProvider>
      {children}
    </VolunteerAuthProvider>
  );
}
