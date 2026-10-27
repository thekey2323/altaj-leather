import React, { Suspense } from "react";
import { OrderConfirmationView } from "@/components/checkout/OrderConfirmationView";

export default function OrderConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto py-24 text-center">
          <p className="text-sm text-altaj-muted">Chargement de votre commande...</p>
        </div>
      }
    >
      <OrderConfirmationView />
    </Suspense>
  );
}
