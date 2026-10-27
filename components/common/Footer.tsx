"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { ShieldCheck, Truck, Clock, RefreshCw, MessageSquare } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-altaj-dark text-altaj-bg border-t border-altaj-borderDark/40 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-14 border-b border-altaj-borderDark/40 text-center">
          <div className="flex flex-col items-center space-y-2 p-3">
            <ShieldCheck className="h-7 w-7 text-altaj-gold stroke-[1.5]" />
            <h4 className="text-xs uppercase font-bold tracking-widest text-white">
              Cuir Véritable 100%
            </h4>
            <p className="text-[11px] text-altaj-sand/70">
              Vachette pleine fleur à tannage végétal
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-3">
            <Clock className="h-7 w-7 text-altaj-gold stroke-[1.5]" />
            <h4 className="text-xs uppercase font-bold tracking-widest text-white">
              Fait Main au Maroc
            </h4>
            <p className="text-[11px] text-altaj-sand/70">
              Savoir-faire artisanal transmis de père en fils
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-3">
            <Truck className="h-7 w-7 text-altaj-gold stroke-[1.5]" />
            <h4 className="text-xs uppercase font-bold tracking-widest text-white">
              Livraison Partout
            </h4>
            <p className="text-[11px] text-altaj-sand/70">
              24h à 48h dans toutes les villes du Royaume
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-3">
            <RefreshCw className="h-7 w-7 text-altaj-gold stroke-[1.5]" />
            <h4 className="text-xs uppercase font-bold tracking-widest text-white">
              Paiement à la Livraison
            </h4>
            <p className="text-[11px] text-altaj-sand/70">
              Vérifiez votre colis avant de régler en espèces
            </p>
          </div>
        </div>

        {/* Main Footer Links & Story */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 py-14">
          <div className="md:col-span-5 space-y-4">
            <Logo variant="light" size="lg" />
            <p className="text-xs text-altaj-sand/80 max-w-sm leading-relaxed font-light mt-3">
              ALTAJLEATHER incarne l'alliance de la noblesse du cuir marocain et du design minimaliste moderne. Chaque portefeuille est assemblé à la main, cousu au fil ciré et conçu pour se patiner avec élégance au fil des années.
            </p>
            <p className="text-[11px] tracking-widest uppercase text-altaj-gold font-semibold pt-1">
              "Leather, crafted in Morocco."
            </p>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
              Collection
            </h5>
            <ul className="space-y-2.5 text-xs text-altaj-sand/75">
              <li>
                <Link href="/shop" className="hover:text-altaj-gold transition-colors">
                  Tous les modèles
                </Link>
              </li>
              <li>
                <Link href="/product/altaj-classic-marron" className="hover:text-altaj-gold transition-colors">
                  ALTAJ Classic Marron
                </Link>
              </li>
              <li>
                <Link href="/product/altaj-noir" className="hover:text-altaj-gold transition-colors">
                  ALTAJ Noir Coutures Rouges
                </Link>
              </li>
              <li>
                <Link href="/product/altaj-signature" className="hover:text-altaj-gold transition-colors">
                  Édition Signature
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
              Informations
            </h5>
            <ul className="space-y-2.5 text-xs text-altaj-sand/75">
              <li>
                <Link href="/about" className="hover:text-altaj-gold transition-colors">
                  Notre Histoire
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns" className="hover:text-altaj-gold transition-colors">
                  Livraison & Retours
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-altaj-gold transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-altaj-gold transition-colors">
                  Politique de Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-altaj-gold transition-colors">
                  Conditions Générales
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
              Service Client
            </h5>
            <p className="text-xs text-altaj-sand/75 leading-relaxed">
              Une question ou une commande spéciale ? Notre équipe marocaine est disponible 7j/7 sur WhatsApp.
            </p>
            <a
              href="https://wa.me/212661234567?text=Bonjour%20ALTAJLEATHER,%20j'ai%20une%20question%20sur%20vos%20produits"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-[#25D366] text-white px-4 py-2.5 rounded-sm hover:bg-[#1EBE5D] transition-colors mt-2"
            >
              <MessageSquare className="h-4 w-4 fill-white" />
              WhatsApp : 06 61 23 45 67
            </a>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-altaj-borderDark/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-altaj-sand/60 gap-4">
          <p>© {new Date().getFullYear()} ALTAJLEATHER Maroc. Tous droits réservés.</p>
          <div className="flex items-center space-x-6">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Instagram
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              TikTok
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Facebook
            </a>
            <Link href="/admin" className="text-altaj-gold hover:underline">
              Administration Pro
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
