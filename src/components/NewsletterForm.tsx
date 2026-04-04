"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Mail } from "lucide-react";

interface NewsletterFormProps {
  variant?: "simple" | "footer";
}

export default function NewsletterForm({ variant = "simple" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setEmail("");
        setName("");
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.error || "Error al suscribirse");
      }
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "footer") {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-stretch justify-center max-w-xl mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email / Correo electrónico"
          className="flex-1 px-6 py-4 rounded-full border-none bg-white shadow-ambient text-on-surface focus:ring-2 focus:ring-secondary"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-secondary text-on-secondary px-10 py-4 rounded-full font-headline font-bold text-sm whitespace-nowrap hover:bg-on-secondary-container transition-colors disabled:opacity-50"
        >
          {loading ? "Suscribiendo..." : "Subscribe"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">¡Suscripción exitosa! Revisa tu email.</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address / Correo Electrónico *
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg !text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name / Nombre (opcional)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg !text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="consent"
          required
          className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="consent" className="text-sm text-gray-600">
          I agree to receive communications in English and Spanish. / Acepto
          recibir comunicaciones en inglés y español.
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-secondary text-on-secondary rounded-full font-bold transition-all hover:bg-on-secondary-container shadow-md disabled:opacity-50"
      >
        {loading ? "Suscribiendo..." : "Subscribe Now / Suscríbase Ahora"}
      </button>
    </form>
  );
}
