import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

    const columns = Object.keys(data[0] || {});
    
    const nameField = columns.find(c => c.toLowerCase().includes("nombre") || c.toLowerCase().includes("name")) || columns[0];
    const lastNameField = columns.find(c => c.toLowerCase().includes("apellido") || c.toLowerCase().includes("last") || c.toLowerCase().includes("apell")) || columns[1];
    const emailField = columns.find(c => c.toLowerCase().includes("email") || c.toLowerCase().includes("correo")) || columns.find(c => c.toLowerCase().includes("mail"));
    const phoneField = columns.find(c => c.toLowerCase().includes("tel") || c.toLowerCase().includes("phone") || c.toLowerCase().includes("fono")) || columns.find(c => c.toLowerCase().includes("cel"));
    const cityField = columns.find(c => c.toLowerCase().includes("ciudad") || c.toLowerCase().includes("city"));
    const workshopField = columns.find(c => c.toLowerCase().includes("taller") || c.toLowerCase().includes("workshop") || c.toLowerCase().includes("event") || c.toLowerCase().includes("conferencia") || c.toLowerCase().includes("asistir"));

    let imported = 0;
    const batch: unknown[] = [];

    for (const row of data) {
      const nombre = String(row[nameField] || "").trim();
      const apellido = String(row[lastNameField] || "").trim();
      const email = emailField ? String(row[emailField] || "").trim() : "";
      const telefono = phoneField ? String(row[phoneField] || "").trim() : "";
      const ciudad = cityField ? String(row[cityField] || "").trim() : "Información no disponibles";
      const taller = workshopField ? String(row[workshopField] || "").trim() : "Información no disponible";

      if (!nombre || nombre === "undefined" || nombre === "nan") continue;

      const participant = {
        nombre,
        apellido,
        email: email && email !== "undefined" && email !== "nan" ? email : "",
        telefono: telefono && telefono !== "undefined" ? telefono : "",
        ciudad: ciudad || "Información no disponible",
        taller: taller || "Información no disponible",
        fuente: file.name.replace(".xlsx", "").substring(0, 50),
        createdAt: serverTimestamp(),
      };

      batch.push(participant);
    }

    if (batch.length > 0) {
      for (const participant of batch) {
        await addDoc(collection(db, "participants"), participant);
        imported++;
      }
    }

    return NextResponse.json({ success: true, imported });
  } catch (error) {
    console.error("Error importing Excel:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}