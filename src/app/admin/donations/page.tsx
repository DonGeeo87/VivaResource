"use client";

import { useState, useEffect } from "react";
import { Save, CreditCard, AlertCircle, CheckCircle, Download, RefreshCw, DollarSign, Users, TrendingUp } from "lucide-react";
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";

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
    paypal_mode: "sandbox"
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
        paypal_email: emailDoc.exists() ? emailDoc.data().value : "",
        paypal_mode: modeDoc.exists() ? modeDoc.data().value : "sandbox"
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

      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<Donation, 'id'>;
        donationList.push({ id: doc.id, ...data });
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
        updated_at: new Date()
      });

      await setDoc(doc(db, "site_settings", "paypal_mode"), {
        value: settings.paypal_mode,
        category: "payments",
        description: "Modo de PayPal: sandbox o live",
        updated_at: new Date()
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
    const headers = [language === "es" ? "Fecha" : "Date", language === "es" ? "Donante" : "Donor", "Email", language === "es" ? "Monto" : "Amount", language === "es" ? "Moneda" : "Currency", language === "es" ? "Frecuencia" : "Frequency", language === "es" ? "Estado" : "Status", "PayPal Order ID"];
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

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `donations-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">{language === "es" ? "Completada" : "Completed"}</span>;
      case "PENDING":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">{language === "es" ? "Pendiente" : "Pending"}</span>;
      case "FAILED":
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">{language === "es" ? "Fallida" : "Failed"}</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 w-72 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-96 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-7 w-20 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              <div>
                <div className="h-5 w-20 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-36 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded-lg" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded-lg" />
            <div className="h-10 w-24 bg-gray-200 rounded-lg" />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div>
                  <div className="h-5 w-36 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-28 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div>
                      <div className="h-4 w-28 bg-gray-200 rounded mb-1" />
                      <div className="h-3 w-36 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-16 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{language === "es" ? "Configuración de Donaciones" : "Donations Configuration"}</h1>
        <p className="text-gray-600 mt-1">{language === "es" ? "Configura PayPal para recibir donaciones y revisa el historial" : "Configure PayPal to receive donations and review history"}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === "es" ? "Total Recaudado" : "Total Raised"}</p>
              <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === "es" ? "Total Donaciones" : "Total Donations"}</p>
              <p className="text-2xl font-bold text-gray-900">{donations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === "es" ? "Promedio" : "Average"}</p>
              <p className="text-2xl font-bold text-gray-900">
                ${donations.length > 0 ? (totalAmount / donations.length).toFixed(2) : "0.00"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PayPal Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">PayPal</h2>
              <p className="text-sm text-gray-500">{language === "es" ? "Configura tu cuenta de PayPal" : "Configure your PayPal account"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "es" ? "Email de PayPal" : "PayPal Email"}
              </label>
              <input
                type="email"
                value={settings.paypal_email}
                onChange={(e) => setSettings({ ...settings, paypal_email: e.target.value })}
                placeholder={language === "es" ? "tu-email@ejemplo.com" : "your-email@example.com"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "es" ? "Modo" : "Mode"}
              </label>
              <select
                value={settings.paypal_mode}
                onChange={(e) => setSettings({ ...settings, paypal_mode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="sandbox">{language === "es" ? "Sandbox (Pruebas)" : "Sandbox (Testing)"}</option>
                <option value="live">{language === "es" ? "Producción" : "Production"}</option>
              </select>
            </div>

            {settings.paypal_mode === "sandbox" && (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">{language === "es" ? "Modo Sandbox Activado" : "Sandbox Mode Enabled"}</p>
                  <p className="text-sm text-yellow-700">
                    {language === "es"
                      ? "Las transacciones no serán procesadas realmente. Usa este modo para pruebas."
                      : "Transactions will not be processed for real. Use this mode for testing."}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving
                ? (language === "es" ? "Guardando..." : "Saving...")
                : (language === "es" ? "Guardar" : "Save")}
            </button>

            {saved && (
              <span className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                {language === "es" ? "Configuración guardada" : "Settings saved"}
              </span>
            )}
          </div>
        </div>

        {/* Donation History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">{language === "es" ? "Historial de Donaciones" : "Donation History"}</h2>
                <p className="text-sm text-gray-500">{donations.length} {language === "es" ? "donaciones registradas" : "donations recorded"}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchDonations}
                disabled={donationsLoading}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title={language === "es" ? "Actualizar" : "Refresh"}
              >
                <RefreshCw className={`w-5 h-5 ${donationsLoading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={exportToCSV}
                disabled={donations.length === 0}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title={language === "es" ? "Exportar CSV" : "Export CSV"}
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {donationsLoading ? (
            <div className="text-center py-8 text-gray-500">{language === "es" ? "Cargando donaciones..." : "Loading donations..."}</div>
          ) : donations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{language === "es" ? "No hay donaciones registradas aún" : "No donations recorded yet"}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-bold text-sm">
                          {donation.donorName?.charAt(0) || "A"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{donation.donorName || "Anonymous"}</p>
                        <p className="text-xs text-gray-500">{donation.donorEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${donation.amount.toFixed(2)}</p>
                      {getStatusBadge(donation.status)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span>
                      {new Date(donation.createdAt).toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="capitalize">{donation.frequency || "one-time"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Links para Donar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
        <h2 className="font-semibold text-lg mb-4">{language === "es" ? "Links de Donación" : "Donation Links"}</h2>
        <p className="text-gray-600 text-sm mb-4">
          {language === "es" ? "Comparte estos links en tu sitio web:" : "Share these links on your website:"}
        </p>

        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">{language === "es" ? "Donación general" : "General donation"}</p>
            <code className="text-sm text-primary">/donate</code>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">PayPal</p>
            <code className="text-sm text-primary">https://paypal.me/{settings.paypal_email || "[email]"}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
