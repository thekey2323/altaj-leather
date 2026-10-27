"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { getSettings } from "@/lib/db/store";

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("212693148230");
  const [message, setMessage] = useState("Bonjour ALTAJLEATHER, je souhaite avoir plus d'informations sur votre produit.");
  const pathname = usePathname();

  useEffect(() => {
    try {
      const s = getSettings();
      if (s.whatsappNumber) setPhoneNumber(s.whatsappNumber.replace(/\+/g, ""));
      if (s.whatsappPrefilledMessage) setMessage(s.whatsappPrefilledMessage);
    } catch {}
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 flex flex-col items-end">
      {/* Tooltip speech bubble */}
      {isOpen && (
        <div className="mb-3 bg-white text-altaj-dark p-4 rounded-sm shadow-luxury border border-altaj-border w-64 animate-fade-in text-xs space-y-2 relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-altaj-muted hover:text-altaj-dark"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
            <span className="font-bold uppercase tracking-wider text-[10px] text-altaj-brown">
              Service Client ALTAJ
            </span>
          </div>
          <p className="text-altaj-text leading-relaxed">
            Besoin d'aide pour choisir votre portefeuille ou passer commande ?
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-[#25D366] text-white font-bold py-2 rounded-sm uppercase tracking-wider hover:bg-[#1EBE5D] transition-colors text-[11px]"
          >
            Discuter sur WhatsApp
          </a>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="relative group">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contacter ALTAJLEATHER sur WhatsApp"
          className="flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-xl hover:scale-105 hover:bg-[#1EBE5D] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366]"
        >
          <MessageSquare className="h-7 w-7 fill-white" />
          {/* Online green indicator */}
          <span className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-white border-2 border-green-500 flex items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          </span>
        </a>
      </div>
    </div>
  );
}
