"use client";

import { useState } from "react";
import { Mail, CheckCircle, XCircle } from "lucide-react";
import Modal from "./ui/Modal";

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Reset state when modal opens
  useState(() => {
    if (isOpen) {
      setEmail("");
      setName("");
      setSuccess(false);
      setError("");
    }
  });

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
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 3000);
      } else {
        setError(data.error || "Error al suscribirse");
      }
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      showCloseButton={true}
      closeOnBackdropClick={!loading}
      closeOnEscape={!loading}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-headline text-2xl font-bold text-primary mb-2">
          Join Our Newsletter
        </h2>
        <p className="text-on-surface-variant text-sm">
          Stay updated with community events and resources. / Manténgase
          informado sobre eventos y recursos comunitarios.
        </p>
      </div>

      {/* Success State */}
      {success ? (
        <div className="text-center py-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="font-headline text-xl font-bold text-primary mb-2">
            ¡Suscripción exitosa!
          </h3>
          <p className="text-on-surface-variant text-sm">
            Thank you for joining! Check your email for confirmation.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name / Nombre (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl !text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address / Correo Electrónico *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl !text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          {/* Consent */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="modal-consent"
              required
              className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="modal-consent" className="text-xs text-gray-600">
              I agree to receive communications in English and Spanish. /
              Acepto recibir comunicaciones en inglés y español.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-lg transition-all hover:shadow-lg disabled:opacity-50"
          >
            {loading ? "Suscribiendo..." : "Subscribe Now / Suscríbase Ahora"}
          </button>
        </form>
      )}
    </Modal>
  );
}
