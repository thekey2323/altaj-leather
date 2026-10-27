"use client";

import React, { useState } from "react";
import { MessageSquare, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
      <div className="text-center space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-altaj-gold">
          Assistance & Questions
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-altaj-dark uppercase">
          CONTACTEZ ALTAJLEATHER
        </h1>
        <p className="text-xs sm:text-sm text-altaj-muted max-w-md mx-auto">
          Notre équipe vous répond sous 2 heures tous les jours de 9h à 20h.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Info Cards */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-sm border border-altaj-border shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-altaj-dark">
              Canaux Directs
            </h3>

            <div className="space-y-4 text-xs">
              <a
                href="https://wa.me/212661234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-900 rounded-sm hover:bg-emerald-100 transition-colors font-medium"
              >
                <MessageSquare className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="font-bold">WhatsApp Direct (Recommandé)</div>
                  <div className="text-[11px] text-emerald-700">06 61 23 45 67</div>
                </div>
              </a>

              <div className="flex items-center gap-3 p-3 bg-altaj-sand/50 rounded-sm text-altaj-dark">
                <Phone className="h-5 w-5 text-altaj-brown flex-shrink-0" />
                <div>
                  <div className="font-bold">Téléphone Support</div>
                  <div className="text-[11px] text-altaj-muted">+212 5 22 45 67 89</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-altaj-sand/50 rounded-sm text-altaj-dark">
                <Mail className="h-5 w-5 text-altaj-brown flex-shrink-0" />
                <div>
                  <div className="font-bold">Email</div>
                  <div className="text-[11px] text-altaj-muted">contact@altajleather.ma</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-altaj-sand/50 rounded-sm text-altaj-dark">
                <MapPin className="h-5 w-5 text-altaj-brown flex-shrink-0" />
                <div>
                  <div className="font-bold">Atelier & Showroom</div>
                  <div className="text-[11px] text-altaj-muted">Casablanca / Fès, Maroc</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-sm border border-altaj-border shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-700 mx-auto" />
              <h4 className="font-serif text-lg font-bold text-altaj-dark">
                Message transmis avec succès !
              </h4>
              <p className="text-xs text-altaj-muted">
                Merci {name}. Un conseiller ALTAJLEATHER prendra contact avec vous rapidement.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-altaj-dark mb-4">
                Envoyez-nous un message
              </h3>

              <Input
                label="Nom complet"
                placeholder="Ex: Omar Berrada"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Numéro de téléphone"
                type="tel"
                placeholder="06XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-altaj-dark/80">
                  Votre message <span className="text-altaj-crimson ml-1">*</span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Posez votre question sur la livraison, la confection ou une commande spéciale..."
                  className="w-full bg-white text-altaj-text border border-altaj-border p-3 text-sm focus:border-altaj-brown focus:outline-none focus:ring-1 focus:ring-altaj-brown rounded-sm"
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full">
                Envoyer ma demande
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
