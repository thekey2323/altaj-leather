"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Truck, PhoneCall, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { MOROCCAN_CITIES, validateMoroccanPhone, formatMAD } from "@/lib/utils";
import { createOrder } from "@/lib/db/store";
import { useCart } from "@/context/CartContext";
import { Product, BundleOffer, CartItem } from "@/types";

interface FastCodFormProps {
  product?: Product;
  selectedBundle?: BundleOffer;
  cartItems?: CartItem[];
  subtotal?: number;
  shippingFee?: number;
  onSuccess?: (orderId: string) => void;
}

export function FastCodForm({
  product,
  selectedBundle,
  cartItems,
  subtotal: propSubtotal,
  shippingFee: propShippingFee = 0,
  onSuccess,
}: FastCodFormProps) {
  const router = useRouter();
  const { clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    city: "Casablanca",
    address: "",
    notes: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute pricing
  let calculatedSubtotal = 0;
  let orderItemsToSubmit: {
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    bundleName?: string;
  }[] = [];

  if (product) {
    if (selectedBundle) {
      calculatedSubtotal = selectedBundle.price;
      orderItemsToSubmit = [
        {
          productId: product.id,
          productName: product.name,
          productImage: product.featuredImage,
          quantity: selectedBundle.quantity,
          unitPrice: selectedBundle.price / selectedBundle.quantity,
          totalPrice: selectedBundle.price,
          bundleName: selectedBundle.name,
        },
      ];
    } else {
      calculatedSubtotal = product.price;
      orderItemsToSubmit = [
        {
          productId: product.id,
          productName: product.name,
          productImage: product.featuredImage,
          quantity: 1,
          unitPrice: product.price,
          totalPrice: product.price,
        },
      ];
    }
  } else if (cartItems && cartItems.length > 0) {
    calculatedSubtotal = propSubtotal || 0;
    orderItemsToSubmit = cartItems.map((item) => {
      const unit = item.bundleOffer
        ? item.bundleOffer.price / item.bundleOffer.quantity
        : item.product.price;
      return {
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.featuredImage,
        quantity: item.quantity,
        unitPrice: unit,
        totalPrice: unit * item.quantity,
        bundleName: item.bundleOffer?.name,
      };
    });
  }

  const shipping = calculatedSubtotal >= 200 ? 0 : propShippingFee || (calculatedSubtotal > 0 ? 25 : 0);
  const grandTotal = calculatedSubtotal + shipping;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, phone: val }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Veuillez indiquer votre nom complet";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Veuillez renseigner votre numéro de téléphone";
    } else {
      const phoneVal = validateMoroccanPhone(formData.phone);
      if (!phoneVal.isValid) {
        newErrors.phone = phoneVal.message || "Numéro marocain invalide (ex: 06XXXXXXXX)";
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = "Veuillez renseigner votre adresse de livraison";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create actual order in database store
      const created = createOrder({
        customerName: formData.fullName.trim(),
        customerPhone: formData.phone.trim(),
        customerAddress: formData.address.trim(),
        customerCity: formData.city,
        notes: formData.notes.trim(),
        items: orderItemsToSubmit,
        subtotal: calculatedSubtotal,
        shippingFee: shipping,
        utmSource: "Direct Web COD",
      });

      // Clear shopping cart
      clearCart();

      if (onSuccess) {
        onSuccess(created.id);
      } else {
        router.push(`/order-confirmed?orderId=${created.id}`);
      }
    } catch (err) {
      console.error("Order creation failed", err);
      alert("Une erreur est survenue lors de l'enregistrement de votre commande. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-5 sm:p-7 rounded-sm border border-altaj-border shadow-luxury">
      <div className="border-b border-altaj-border pb-4 mb-5">
        <div className="flex items-center gap-2 text-altaj-gold font-bold text-xs uppercase tracking-widest">
          <Truck className="h-4 w-4" />
          <span>Paiement Cash à la Livraison (COD)</span>
        </div>
        <h3 className="font-serif text-lg md:text-xl font-bold text-altaj-dark uppercase tracking-wider mt-1">
          COMMANDER MAINTENANT
        </h3>
        <p className="text-xs text-altaj-muted mt-1">
          Remplissez le formulaire en 30 secondes. Paiement à la réception du colis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <Input
          label="Nom complet"
          placeholder="Ex: Yassine El Amrani"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          error={errors.fullName}
          required
        />

        {/* Moroccan Phone Number */}
        <Input
          label="Téléphone (WhatsApp / Appel)"
          type="tel"
          placeholder="06 12 34 56 78 ou 07..."
          value={formData.phone}
          onChange={handlePhoneChange}
          error={errors.phone}
          helperText="Notre conseiller vous appellera pour confirmer l'expédition"
          required
        />

        {/* City and Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Ville"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            options={MOROCCAN_CITIES.map((c) => ({ value: c, label: c }))}
            required
          />

          <Input
            label="Adresse complète"
            placeholder="Quartier, Rue, N° d'appartement / maison"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            error={errors.address}
            required
          />
        </div>

        {/* Optional Notes */}
        <Input
          label="Instructions de livraison (Optionnel)"
          placeholder="Ex: Livrer après 16h ou au bureau"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />

        {/* Summary pricing line */}
        <div className="p-3 bg-altaj-sand/60 rounded-sm border border-altaj-border text-xs space-y-1 mt-4">
          <div className="flex justify-between text-altaj-dark">
            <span>Articles ({orderItemsToSubmit.reduce((s, i) => s + i.quantity, 0)})</span>
            <span className="font-semibold">{formatMAD(calculatedSubtotal)}</span>
          </div>
          <div className="flex justify-between text-altaj-dark">
            <span>Frais de livraison ({formData.city})</span>
            <span className="font-semibold">
              {shipping === 0 ? (
                <span className="text-emerald-800 font-bold">GRATUITE</span>
              ) : (
                formatMAD(shipping)
              )}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold text-altaj-dark pt-1.5 border-t border-altaj-border">
            <span>Total net à payer :</span>
            <span className="font-serif text-base text-altaj-brown">{formatMAD(grandTotal)}</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          type="submit"
          variant="gold"
          size="lg"
          isLoading={isSubmitting}
          className="w-full text-sm py-4 tracking-widest font-bold shadow-gold-glow mt-4"
        >
          CONFIRMER MA COMMANDE
        </Button>

        {/* Reassurance points under CTA */}
        <div className="pt-3 space-y-1.5 text-[11px] text-altaj-dark/80 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 flex-shrink-0" />
            <span>Paiement à la livraison après inspection de votre colis</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 flex-shrink-0" />
            <span>Livraison rapide 24h - 48h partout au Maroc</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 flex-shrink-0" />
            <span>Commande vérifiée par téléphone ou WhatsApp avant expédition</span>
          </div>
        </div>
      </form>
    </div>
  );
}
