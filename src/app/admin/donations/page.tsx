"use client";

import { useState, useEffect } from "react";
import { Save, CreditCard, AlertCircle, CheckCircle, Download, RefreshCw, DollarSign, Users, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  PageShell,
  PageHeader,
  StatCard,
  Card,
  CardHeader,
  CardBody,
  StatusBadge,
  AdminButton,
  Field,
  Input,
  Select,
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  TableEmpty,
  TableSkeleton,
} from "@/components/admin";

import { db, collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc } from "@/lib/db-client";

interface Donation {
  id: string;
  amount: number;
  currency: string;
  donorName: string;
  donorEmail: string;
  frequency: string;
  status: string;
  createdAt: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
}

export default function AdminDonationsPage(): JSX.Element {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [donationsLoading, setDonationsLoading] = useState(true);

  const [settings, setSettings] = useState({
    paypal_email: "",
    paypal_mode: "sandbox",
  });

  const [donations, setDonations] = useState<Donation[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchSettings();
    fetchDonations();
  }, []);

  const fetchSettings = async () => {
    try {
      const emailDoc = await getDoc(doc(db, "site_settings", "paypal_email"));
      const modeDoc = await getDoc(doc(db, "site_settings", "paypal_mode"));
      setSettings({
        paypal_email: emailDoc.exists ? emailDoc.data()?.value : "",
        paypal_mode: modeDoc.exists ? modeDoc.data()?.value : "sandbox",
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async () => {
    setDonationsLoading(true);
    try {
      const q = query(collection(db, "donations"), orderBy("createdAt", "desc"), limit(50));
      const snapshot = await getDocs(q);
      const donationList: Donation[] = [];
      let total = 0;
      snapshot.forEach((d) => {
        const data = d.data() as Omit<Donation, "id">;
        donationList.push({ id: d.id, ...data });
        total += data.amount || 0;
      });
      setDonations(donationList);
      setTotalAmount(total);
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setDonationsLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await setDoc(doc(db, "site_settings", "paypal_email"), {
        value: settings.paypal_email,
        category: "payments",
        description: "Email de PayPal para donaciones",
        updated_at: new Date(),
      });
      await setDoc(doc(db, "site_settings", "paypal_mode"), {
        value: settings.paypal_mode,
        category: "payments",
        description: "Modo de PayPal: sandbox o live",
        updated_at: new Date(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert(language === "es" ? "Error al guardar la configuración" : "Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Donor", "Email", "Amount", "Currency", "Frequency", "Status", "PayPal Order ID"];
    const rows = donations.map((d) => [
      new Date(d.createdAt).toLocaleDateString(),
      d.donorName || "Anonymous",
      d.donorEmail || "",
      d.amount.toFixed(2),
      d.currency || "USD",
      d.frequency || "one-time",
      d.status || "unknown",
      d.paypalOrderId || "",
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `donations-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return language === "es" ? "Completada" : "Completed";
      case "PENDING":
        return language === "es" ? "Pendiente" : "Pending";
      case "FAILED":
        return language === "es" ? "Fallida" : "Failed";
      default:
        return status;
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={language === "es" ? "Donaciones" : "Donations"}
        description={language === "es" ? "Configura PayPal y revisa el historial" : "Configure PayPal and review history"}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={language === "es" ? "Total Recaudado" : "Total Raised"} value={`$${totalAmount.toFixed(2)}`} icon={<DollarSign className="w-5 h-5" />} tone="success" loading={donationsLoading} />
        <StatCard label={language === "es" ? "Total Donaciones" : "Total Donations"} value={donations.length} icon={<Users className="w-5 h-5" />} loading={donationsLoading} />
        <StatCard label={language === "es" ? "Promedio" : "Average"} value={`$${donations.length > 0 ? (totalAmount / donations.length).toFixed(2) : "0.00"}`} icon={<TrendingUp className="w-5 h-5" />} tone="info" loading={donationsLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Configuración PayPal */}
        <Card>
          <CardHeader title="PayPal" icon={<CreditCard className="w-4 h-4 text-primary" />} />
          <CardBody className="space-y-4">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-10 bg-surface-high rounded" />
                <div className="h-10 bg-surface-high rounded" />
              </div>
            ) : (
              <>
                <Field label={language === "es" ? "Email de PayPal" : "PayPal Email"} htmlFor="paypal_email">
                  <Input
                    id="paypal_email"
                    type="email"
                    value={settings.paypal_email}
                    onChange={(e) => setSettings({ ...settings, paypal_email: e.target.value })}
                    placeholder={language === "es" ? "tu-email@ejemplo.com" : "your-email@example.com"}
                  />
                </Field>

                <Field label={language === "es" ? "Modo" : "Mode"} htmlFor="paypal_mode" helper={language === "es" ? "Sandbox para pruebas, Producción para cobrar de verdad." : "Sandbox for testing, Production to charge for real."}>
                  <Select
                    id="paypal_mode"
                    value={settings.paypal_mode}
                    onChange={(e) => setSettings({ ...settings, paypal_mode: e.target.value })}
                  >
                    <option value="sandbox">{language === "es" ? "Sandbox (Pruebas)" : "Sandbox (Testing)"}</option>
                    <option value="live">{language === "es" ? "Producción" : "Production"}</option>
                  </Select>
                </Field>

                {settings.paypal_mode === "sandbox" && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">{language === "es" ? "Modo Sandbox Activado" : "Sandbox Mode Enabled"}</p>
                      <p className="text-sm text-amber-700">
                        {language === "es"
                          ? "Las transacciones no se procesan realmente. Usa este modo solo para pruebas."
                          : "Transactions will not be processed for real. Use this mode for testing only."}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <AdminButton icon={<Save className="w-4 h-4" />} onClick={handleSave} disabled={saving}>
                    {saving ? (language === "es" ? "Guardando..." : "Saving...") : (language === "es" ? "Guardar" : "Save")}
                  </AdminButton>
                  {saved && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                      {language === "es" ? "Guardado" : "Saved"}
                    </span>
                  )}
                </div>
              </>
            )}
          </CardBody>
        </Card>

        {/* Historial */}
        <Card>
          <CardHeader
            title={language === "es" ? "Historial de Donaciones" : "Donation History"}
            icon={<DollarSign className="w-4 h-4 text-primary" />}
            actions={
              <>
                <AdminButton variant="ghost" size="xs" icon={<RefreshCw className={`w-4 h-4 ${donationsLoading ? "animate-spin" : ""}`} />} onClick={fetchDonations} disabled={donationsLoading} aria-label={language === "es" ? "Actualizar" : "Refresh"} />
                <AdminButton variant="ghost" size="xs" icon={<Download className="w-4 h-4" />} onClick={exportToCSV} disabled={donations.length === 0} aria-label="Export CSV" />
              </>
            }
          />
          <Table>
            <Thead>
              <Th>{language === "es" ? "Donante" : "Donor"}</Th>
              <Th align="right">{language === "es" ? "Monto" : "Amount"}</Th>
              <Th align="center">{language === "es" ? "Estado" : "Status"}</Th>
              <Th align="right">{language === "es" ? "Fecha" : "Date"}</Th>
            </Thead>
            <Tbody>
              {donationsLoading ? (
                <TableSkeleton rows={4} cols={4} />
              ) : donations.length === 0 ? (
                <TableEmpty colSpan={4}>{language === "es" ? "No hay donaciones registradas aún" : "No donations recorded yet"}</TableEmpty>
              ) : (
                donations.map((donation) => (
                  <Tr key={donation.id}>
                    <Td>
                      <span className="font-medium text-on-surface">{donation.donorName || "Anonymous"}</span>
                      <span className="block text-xs text-on-surface-variant">{donation.donorEmail}</span>
                    </Td>
                    <Td align="right"><span className="font-semibold text-on-surface tabular-nums">${donation.amount.toFixed(2)}</span></Td>
                    <Td align="center"><StatusBadge status={donation.status}>{statusLabel(donation.status)}</StatusBadge></Td>
                    <Td align="right">{new Date(donation.createdAt).toLocaleDateString(language === "es" ? "es-ES" : "en-US", { year: "numeric", month: "short", day: "numeric" })}</Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Card>
      </div>

      {/* Links */}
      <Card>
        <CardHeader title={language === "es" ? "Links de Donación" : "Donation Links"} />
        <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-surface-low rounded-md">
            <p className="text-xs text-on-surface-variant mb-1">{language === "es" ? "Donación general" : "General donation"}</p>
            <code className="text-sm text-primary">/donate</code>
          </div>
          <div className="p-3 bg-surface-low rounded-md">
            <p className="text-xs text-on-surface-variant mb-1">PayPal</p>
            <code className="text-sm text-primary break-all">https://paypal.me/{settings.paypal_email || "[email]"}</code>
          </div>
        </CardBody>
      </Card>
    </PageShell>
  );
}
