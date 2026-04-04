"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EventRegistrationsRedirect(): null {
  const router = useRouter();

  useEffect(() => {
    // Redirect to events page where registrations are now integrated
    router.replace("/admin/events");
  }, [router]);

  return null;
}
