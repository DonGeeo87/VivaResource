"use client";

import { useState, useEffect } from "react";
import { Verified, Lock, Package, HeartHandshake, Handshake, Quote, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { PayPalScriptProvider, PayPalButtons, FUNDING } from "@paypal/react-paypal-js";

const donationAmounts = [
  { amount: 25, description: "Provides a hygiene kit / Proporciona un kit de higiene" },
  { amount: 50, amountKey: "amount50", description: "A week of food / Una semana de alimentos" },
  { amount: 100, amountKey: "amount100", description: "Utility assistance / Asistencia de servicios" },
  { amount: 250, amountKey: "amount250", description: "Rental support / Apoyo para el alquiler" },
  { amount: 500, amountKey: "amount500", description: "Emergency grant / Beca de emergencia" },
  { amount: 0, amountKey: "customAmount", description: "Any amount helps / Cualquier cantidad ayuda", custom: true },
];

interface DonationFormState {
  donorName: string;
  donorEmail: string;
}

function DonateForm(): JSX.Element {
  const { translations } = useLanguage();
  const { donate: t } = translations;

  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState("");
  const [donorInfo, setDonorInfo] = useState<DonationFormState>({
    donorName: "",
    donorEmail: "",
  });
  const [donationStatus, setDonationStatus] = useState<"idle" | "processing" | "success" | "error" | "cancelled">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    if (amount !== 0) {
      setCustomAmount("");
    }
  };

  const getFinalAmount = (): number => {
    if (selectedAmount === 0 && customAmount) {
      return parseFloat(customAmount);
    }
    return selectedAmount;
  };

  const createOrder = async (): Promise<string> => {
    const amount = getFinalAmount();
    if (!amount || amount <= 0) {
      setErrorMessage("Please select or enter a valid amount");
      return Promise.reject("Invalid amount");
    }
    if (!donorInfo.donorName || !donorInfo.donorEmail) {
      setErrorMessage("Please enter your name and email");
      return Promise.reject("Missing donor info");
    }

    setDonationStatus("processing");
    setErrorMessage("");

    const response = await fetch("/api/donations/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency: "USD",
        donorName: donorInfo.donorName,
        donorEmail: donorInfo.donorEmail,
        frequency,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      setErrorMessage(error.error || "Failed to create order");
      setDonationStatus("error");
      throw new Error(error.error);
    }

    const data = await response.json();
    return data.orderId;
  };

  const onApprove = async (data: { orderID: string }): Promise<void> => {
    try {
      const response = await fetch("/api/donations/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: data.orderID }),
      });

      if (!response.ok) {
        throw new Error("Failed to capture payment");
      }

      const result = await response.json();
      if (result.success) {
        setDonationStatus("success");
      } else {
        setDonationStatus("error");
        setErrorMessage("Payment processing failed");
      }
    } catch {
      setDonationStatus("error");
      setErrorMessage("An error occurred while processing your donation");
    }
  };

  const onError = (): void => {
    setDonationStatus("error");
    setErrorMessage("Payment was not completed");
  };

  const onCancel = (): void => {
    setDonationStatus("cancelled");
  };

  if (donationStatus === "success") {
    return (
      <div className="bg-surface-lowest p-8 md:p-12 rounded-xl shadow-sm text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-primary mb-4">{t.thankYou || "Thank You!"}</h2>
        <p className="text-lg text-on-surface-variant mb-6">
          {t.donationReceived || "Your donation has been received. A confirmation email will be sent to"} {donorInfo.donorEmail}
        </p>
        <p className="text-2xl font-bold text-secondary mb-8">
          ${getFinalAmount().toFixed(2)} {frequency === "monthly" ? "/ month" : ""}
        </p>
        <button
          onClick={() => {
            setDonationStatus("idle");
            setSelectedAmount(25);
            setDonorInfo({ donorName: "", donorEmail: "" });
          }}
          className="px-8 py-3 bg-primary text-on-primary rounded-full font-semibold hover:opacity-90 transition-all"
        >
          {t.makeAnotherDonation || "Make Another Donation"}
        </button>
      </div>
    );
  }

  if (donationStatus === "cancelled") {
    return (
      <div className="bg-surface-lowest p-8 md:p-12 rounded-xl shadow-sm text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-yellow-600" />
        </div>
        <h2 className="text-3xl font-bold text-primary mb-4">{t.donationCancelled || "Donation Cancelled"}</h2>
        <p className="text-lg text-on-surface-variant mb-6">
          {t.cancelledMessage || "Your donation was not processed. You can try again."}
        </p>
        <button
          onClick={() => setDonationStatus("idle")}
          className="px-8 py-3 bg-primary text-on-primary rounded-full font-semibold hover:opacity-90 transition-all"
        >
          {t.tryAgain || "Try Again"}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-lowest p-8 md:p-12 rounded-xl shadow-sm">
      <h2 className="text-3xl font-bold text-primary mb-8">Make an Impact / Hacer un Impacto</h2>

      {/* Frequency Toggle */}
      <div className="flex p-1 bg-surface-high rounded-full w-fit mb-10">
        <button
          onClick={() => setFrequency("one-time")}
          className={`px-8 py-2 rounded-full text-sm font-semibold transition-all ${
            frequency === "one-time" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          {t.oneTime}
        </button>
        <button
          onClick={() => setFrequency("monthly")}
          className={`px-8 py-2 rounded-full text-sm font-semibold transition-all ${
            frequency === "monthly" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          {t.monthly}
        </button>
      </div>

      {/* Preset Amounts */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {donationAmounts.map((option) => (
          <button
            key={option.amount}
            onClick={() => handleAmountSelect(option.amount)}
            className={`p-6 border-2 rounded-xl transition-all text-left ${
              selectedAmount === option.amount
                ? "border-primary bg-primary/5"
                : "border-transparent bg-surface-high hover:border-primary/50"
            }`}
          >
            {option.custom ? (
              <>
                {selectedAmount === 0 ? (
                  <input
                    type="number"
                    placeholder="$"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="text-2xl font-bold text-on-surface bg-transparent w-full outline-none border-b-2 border-primary"
                    onClick={(e) => e.stopPropagation()}
                    min="1"
                  />
                ) : (
                  <div className="text-2xl font-bold text-on-surface mb-1">{t.customAmount}</div>
                )}
              </>
            ) : (
              <div className="text-2xl font-bold text-primary mb-1">
                {option.amountKey ? t[option.amountKey as keyof typeof t] : `$${option.amount}`}
              </div>
            )}
            <div className="text-xs text-on-surface-variant leading-tight">{option.description}</div>
          </button>
        ))}
      </div>

      {/* Donor Info */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
              Full Name / Nombre Completo
            </label>
            <input
              type="text"
              value={donorInfo.donorName}
              onChange={(e) => setDonorInfo({ ...donorInfo, donorName: e.target.value })}
              placeholder="Jane Doe"
              className="w-full bg-surface-highest border-none rounded-lg p-4 focus:ring-2 focus:ring-primary transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
              Email / Correo Electrónico
            </label>
            <input
              type="email"
              value={donorInfo.donorEmail}
              onChange={(e) => setDonorInfo({ ...donorInfo, donorEmail: e.target.value })}
              placeholder="jane@example.com"
              className="w-full bg-surface-highest border-none rounded-lg p-4 focus:ring-2 focus:ring-primary transition-all outline-none"
            />
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Processing State */}
        {donationStatus === "processing" && (
          <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-lg">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-700">Processing your donation...</span>
          </div>
        )}

        <div className="flex items-center space-x-3 text-sm text-on-surface-variant">
          <Lock className="text-secondary w-4 h-4" />
          <span>Secure payment powered by PayPal / Pago seguro con PayPal</span>
        </div>

        {/* PayPal Button */}
        <PayPalButtons
          style={{ layout: "vertical", shape: "pill", label: "donate" }}
          fundingSource={FUNDING.PAYPAL}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          onCancel={onCancel}
          disabled={donationStatus === "processing" || !donorInfo.donorName || !donorInfo.donorEmail}
        />
      </div>
    </div>
  );
}

export default function DonatePage(): JSX.Element {
  const { translations } = useLanguage();
  const { donate: t } = translations;
  const [paypalReady, setPaypalReady] = useState(false);

  useEffect(() => {
    setPaypalReady(true);
  }, []);

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    currency: "USD",
    intent: "capture",
  };

  return (
    <main className="bg-surface text-on-surface">
      <div className="pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <h1 className="text-5xl md:text-6xl font-extrabold text-primary leading-tight tracking-tight mb-6 font-headline">
                {t.title}
              </h1>
              <p className="text-lg text-on-surface-variant max-w-xl mb-8 leading-relaxed">
                Your gift provides critical resources to rural families in Colorado. / Su donación proporciona recursos críticos a las familias rurales de
                Colorado.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 text-secondary font-semibold">
                  <Verified className="w-5 h-5" />
                  <span>Tax-Deductible 501(c)(3)</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-secondary-container/30 rounded-full blur-3xl"></div>
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnZEXadlEb8zoAW2EYMtwdF_swwjJgygOgqgwBFI2WN4zWE1wQvoRGkzyXE-XM4chB6R9oiYyyPmEYWQeGJoLNbWo59tc_N6KnCyWDE6ANfylinJsjYFCp5eyRri5uMeeSOz5JBCGYi6Ya8walmRAxHxFi4H79stqiZsPn6FXMVC1-jJODNI03OfHVhJA9lF50YArIoNAkt0GxoJ94HMs6sjzWquId-t_5wIvqbi1rZh6ZiiapVyMI5Sc_iY8CovxxYPqgETVRU5U"
                alt="Community Support"
                width={600}
                height={400}
                className="rounded-xl shadow-xl relative z-10 w-full h-[400px] object-cover border-4 border-surface-lowest"
              />
            </div>
          </div>
        </section>

        {/* Donation Form & Impact Stories */}
        <section className="py-20 bg-surface-low">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* Form Column */}
              <div className="lg:col-span-7">
                {paypalReady && process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? (
                  <PayPalScriptProvider options={initialOptions}>
                    <DonateForm />
                  </PayPalScriptProvider>
                ) : (
                  <div className="bg-surface-lowest p-8 md:p-12 rounded-xl shadow-sm">
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                      <p className="text-on-surface-variant">Loading PayPal... / Cargando PayPal...</p>
                      {!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && (
                        <p className="text-red-600 text-sm mt-4">
                          PayPal Client ID not configured. Please add NEXT_PUBLIC_PAYPAL_CLIENT_ID to .env.local
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Side Info Column */}
              <div className="lg:col-span-5 space-y-12">
                {/* Transparency Card */}
                <div className="bg-primary p-8 rounded-xl text-on-primary relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full"></div>
                  <h3 className="text-2xl font-bold mb-6">Where Your Money Goes / Adónde Va Su Dinero</h3>
                  <div className="flex items-end space-x-4 mb-6">
                    <div className="flex-1 bg-white/20 h-32 rounded-t-lg relative group">
                      <div className="absolute bottom-0 w-full bg-secondary-container h-[92%] rounded-t-lg transition-all"></div>
                      <span className="absolute -top-8 left-0 text-sm font-bold">92%</span>
                    </div>
                    <div className="flex-1 bg-white/20 h-32 rounded-t-lg relative group">
                      <div className="absolute bottom-0 w-full bg-white/40 h-[8%] rounded-t-lg transition-all"></div>
                      <span className="absolute -top-8 left-0 text-sm font-bold">8%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-secondary-container rounded-full"></span>
                      <span>Direct Programs / Programas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-white/40 rounded-full"></span>
                      <span>Admin & Ops / Administración</span>
                    </div>
                  </div>
                </div>

                {/* Testimonial */}
                <div className="relative pt-8">
                  <Quote className="w-16 h-16 text-primary/10 absolute -top-2 -left-4 fill-primary/10" />
                  <div className="relative z-10">
                    <p className="text-xl italic text-on-surface-variant mb-6 leading-relaxed">
                      &ldquo;Viva Resource Foundation didn&apos;t just give us food; they gave us hope when our car broke down and we couldn&apos;t get to
                      work. They are family.&rdquo;
                      <span className="block mt-2 font-body text-sm not-italic opacity-70">&mdash; Maria & Family, Alamosa CO</span>
                    </p>
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvuH0wH7x2E_yjDdqx7VCF-NcTPVesWtSRrCB8m5oM6HI8UJFM_OEJZv9m4x42zZzuGCyOiKAgpCHmN44XHmljk6sf5pVsfgXa2aXXUezWhPfkvbtdlic3IbgVfAyormFPy4TkC4tFu0KvlmPHoTA63MhnusVqtOCgJbkfQPOWJ8ZZrC6CWqSkYt2JU6mk-FPQ8sgWy0wAWdbPH5ukLqUMq1IdpU9n1Zb23Toy-w5lZ_HI3Eo9CYcr8WjCasmasscBKMP3N2Y2nAA"
                      alt="Maria"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full border-4 border-surface-lowest shadow-sm object-cover"
                    />
                  </div>
                </div>

                {/* Tax Info */}
                <div className="p-6 bg-surface-high rounded-xl border-l-4 border-primary">
                  <h4 className="font-bold text-primary mb-2">Tax-Deductibility / Deductibilidad de Impuestos</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Viva Resource Foundation is a registered 501(c)(3) non-profit organization. All donations are tax-deductible to the extent allowed by
                    law.
                    <br />
                    <br />
                    Viva Resource Foundation es una organización sin fines de lucro 501(c)(3) registrada. Todas las donaciones son deducibles de impuestos
                    en la medida permitida por la ley.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Other Ways to Give */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary text-center mb-16 font-headline">
            Alternative Ways to Support / Otras Formas de Apoyar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Gift in Kind */}
            <div className="p-10 bg-surface rounded-2xl group hover:bg-surface-low transition-all">
              <div className="w-14 h-14 bg-secondary-container/40 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Package className="text-secondary w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Gift in Kind / Donación en especie</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                Donate food, winter clothing, or household essentials directly to our rural distribution centers.
              </p>
              <Link href="#" className="text-primary font-bold text-sm hover:underline decoration-2 underline-offset-4">
                Learn More / Leer Más →
              </Link>
            </div>

            {/* Volunteering */}
            <div className="p-10 bg-surface rounded-2xl group hover:bg-surface-low transition-all">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <HeartHandshake className="text-primary w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Volunteering / Voluntariado</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                Your time is as valuable as your treasure. Join us for community events and outreach programs.
              </p>
              <Link href="/get-involved" className="text-primary font-bold text-sm hover:underline decoration-2 underline-offset-4">
                Join Us / Únase a Nosotros →
              </Link>
            </div>

            {/* Corporate Matching */}
            <div className="p-10 bg-surface rounded-2xl group hover:bg-surface-low transition-all">
              <div className="w-14 h-14 bg-surface-high rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Handshake className="text-on-surface-variant w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Corporate Matching / Emparejamiento Corporativo</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                Double your impact. Check if your employer offers a donation matching program.
              </p>
              <Link href="#" className="text-primary font-bold text-sm hover:underline decoration-2 underline-offset-4">
                Check Eligibility / Ver Elegibilidad →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
