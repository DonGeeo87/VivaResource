import { NextResponse } from "next/server";

import { adminDb } from "@/lib/admin-db";
import { verifyToken, getTokenFromHeader } from "@/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const token = getTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Este endpoint es del portal del voluntario: un token de admin no sirve.
    if (payload.type !== "volunteer") {
      return NextResponse.json(
        { error: "Solo para cuentas de voluntario" },
        { status: 403 }
      );
    }

    // Perfil directo contra PostgreSQL. Antes usaba db-client, que del lado
    // servidor hace fetch a una URL relativa y siempre lanzaba excepción.
    const db = await adminDb();
    const userDoc = await db.collection("volunteer_users").doc(payload.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "Voluntario no encontrado" }, { status: 404 });
    }

    const data = userDoc.data();
    return NextResponse.json({
      uid: payload.uid,
      email: payload.email,
      firstName: data?.firstName || "",
      lastName: data?.lastName || "",
      phone: data?.phone || "",
      status: data?.status || "active",
      registrationId: data?.registrationId,
      joinedAt: data?.joinedAt?.toDate?.()?.toISOString() || data?.joinedAt,
      lastLoginAt: data?.lastLoginAt?.toDate?.()?.toISOString() || data?.lastLoginAt,
      language: data?.language || "en",
      notificationsEnabled: data?.notificationsEnabled ?? true,
      unreadMessages: data?.unreadMessages || 0,
      upcomingTasks: data?.upcomingTasks || 0,
    });
  } catch (error) {
    console.error("Volunteer profile error:", error);
    return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 });
  }
}
