import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Award, Sparkles } from "lucide-react";

export const metadata = {
  title: "Notre Histoire & Savoir-Faire | ALTAJLEATHER Maroc",
  description: "Découvrez l'atelier ALTAJLEATHER, l'alliance de la tradition marocaine de la maroquinerie et d'un design contemporain.",
};

export default function AboutPage() {
  return (
    <div className="space-y-16 py-10 md:py-16">
      {/* Intro Editorial Header */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-altaj-gold">
          Manifeste ALTAJLEATHER
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-altaj-dark tracking-tight">
          L'ÉLÉGANCE DU CUIR MAROCAIN, REPENSER POUR DURER
        </h1>
        <p className="text-sm sm:text-base text-altaj-dark/80 max-w-2xl mx-auto leading-relaxed font-light">
          ALTAJLEATHER est née d'une conviction simple : l'artisanat marocain possède une noblesse séculaire qui mérite d'être sublimée dans des lignes modernes, masculines et fonctionnelles.
        </p>
      </section>

      {/* Hero photography block */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-altaj-border shadow-sm">
            <Image
              src="/images/products/altaj-classic-brown-front.jpg"
              alt="Portefeuille cuir ALTAJ marron fermé"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-altaj-border shadow-sm">
            <Image
              src="/images/products/altaj-noir-front.jpg"
              alt="Portefeuille cuir ALTAJ noir coutures rouges"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Craftsmanship Pillars */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="space-y-3 bg-white p-6 rounded-sm border border-altaj-border shadow-sm">
            <ShieldCheck className="h-6 w-6 text-altaj-gold mx-auto sm:mx-0" />
            <h3 className="font-serif text-base font-bold uppercase text-altaj-dark">
              Cuir Pleine Fleur
            </h3>
            <p className="text-xs text-altaj-muted leading-relaxed">
              Nous sélectionnons exclusivement des peaux de vachette au tannage végétal naturel. Aucun vernis plastique artificiel : le cuir respire et acquiert une patine unique avec le temps.
            </p>
          </div>

          <div className="space-y-3 bg-white p-6 rounded-sm border border-altaj-border shadow-sm">
            <Award className="h-6 w-6 text-altaj-gold mx-auto sm:mx-0" />
            <h3 className="font-serif text-base font-bold uppercase text-altaj-dark">
              Coutures au Fil Ciré
            </h3>
            <p className="text-xs text-altaj-muted leading-relaxed">
              Inspiré du traditionnel point sellier, chaque point d'arrêt et de tranche est solidarisé avec un fil de lin imprégné de cire pour résister à l'usure de vos poches pendant des années.
            </p>
          </div>

          <div className="space-y-3 bg-white p-6 rounded-sm border border-altaj-border shadow-sm">
            <Sparkles className="h-6 w-6 text-altaj-gold mx-auto sm:mx-0" />
            <h3 className="font-serif text-base font-bold uppercase text-altaj-dark">
              Finition à la Cire d'Abeille
            </h3>
            <p className="text-xs text-altaj-muted leading-relaxed">
              Les tranches brutes subissent un ponçage fin à la main et un brunissage à la cire d'abeille de l'Atlas, scellant les fibres du cuir contre l'humidité.
            </p>
          </div>
        </div>

        {/* Story Paragraphs */}
        <div className="bg-altaj-sand/60 p-8 sm:p-12 rounded-sm border border-altaj-border space-y-6 text-xs sm:text-sm text-altaj-dark/90 leading-relaxed max-w-3xl mx-auto">
          <h2 className="font-serif text-xl sm:text-2xl font-bold uppercase text-altaj-dark text-center">
            Un Hommage aux Maîtres Maroquiniers
          </h2>
          <p>
            À Fès et à Marrakech, le travail du cuir est un art qui traverse les siècles. En créant ALTAJLEATHER, notre objectif n'était pas de reproduire des babouches ou des poufs folkloriques, mais d'appliquer cette virtuosité manuelle à l'objet le plus intime et indispensable de l'homme contemporain : son portefeuille.
          </p>
          <p>
            Chaque modèle est calibré au millimètre près pour accueillir vos billets de banque marocains (200 DH, 100 DH) sans débordement, ainsi que vos cartes d'identité et de crédit dans une découpe fluide et ergonomique.
          </p>
          <div className="pt-4 text-center">
            <Link href="/shop">
              <Button variant="gold" size="lg">
                Découvrir la Collection (119 DH)
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
