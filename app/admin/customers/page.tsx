"use client";

import React, { useState, useEffect } from "react";
import { getCustomers, getOrders } from "@/lib/db/store";
import { Customer, Order } from "@/types";
import { formatMAD } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Search, PhoneCall, MessageSquare, ShieldCheck, Users } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    const orders = getOrders().filter((o) => o.customerPhone === c.phone);
    setCustomerOrders(orders);
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-altaj-gold">Base Clients</span>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-altaj-dark uppercase">CLIENTS ({customers.length})</h1>
      </div>

      <div className="bg-white p-4 rounded-sm border border-altaj-border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-altaj-muted" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-altaj-sand/30 border border-altaj-border pl-9 pr-4 py-2 text-xs rounded-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-sm border border-altaj-border shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-altaj-sand/50 border-b border-altaj-border text-[10px] uppercase font-bold text-altaj-dark">
              <tr>
                <th className="p-3.5">Client</th>
                <th className="p-3.5">Ville</th>
                <th className="p-3.5">Commandes</th>
                <th className="p-3.5">Total Dépensé</th>
                <th className="p-3.5">Score COD</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-altaj-border/60">
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => handleSelectCustomer(c)} className="cursor-pointer hover:bg-altaj-sand/20">
                  <td className="p-3.5">
                    <div className="font-bold text-altaj-dark">{c.name}</div>
                    <div className="text-[11px] text-altaj-muted">{c.phone}</div>
                  </td>
                  <td className="p-3.5">{c.city}</td>
                  <td className="p-3.5">{c.totalOrders} cmd{c.totalOrders > 1 ? "s" : ""}</td>
                  <td className="p-3.5 font-serif font-bold text-altaj-brown">{formatMAD(c.totalSpent)}</td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-[2px] bg-emerald-100 text-emerald-900">
                      <ShieldCheck className="h-3 w-3" />
                      {c.reliabilityScore}%
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <Button size="sm" variant="outline" className="text-[10px] px-2 py-1">Fiche</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-4">
          {selectedCustomer ? (
            <div className="bg-white rounded-sm border border-altaj-border shadow-sm p-6 space-y-4">
              <h3 className="font-serif text-lg font-bold text-altaj-dark">{selectedCustomer.name}</h3>
              <p className="text-xs text-altaj-muted">{selectedCustomer.city}, Maroc</p>
              <div className="grid grid-cols-2 gap-2">
                <a href={`tel:${selectedCustomer.phone}`} className="flex items-center justify-center gap-1.5 p-2 bg-blue-50 text-blue-700 rounded-sm text-xs font-bold">
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>Appeler</span>
                </a>
                <a href={`https://wa.me/212${selectedCustomer.phone.replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 p-2 bg-[#25D366]/20 text-[#1EBE5D] rounded-sm text-xs font-bold">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
              <div className="p-3 bg-altaj-sand/30 rounded-sm text-xs">
                <span className="font-bold text-altaj-dark">Adresse :</span>
                <p className="text-altaj-muted mt-1">{selectedCustomer.address}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-sm border border-altaj-border shadow-sm p-8 text-center text-xs text-altaj-muted">
              Sélectionnez un client pour voir les détails.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
