"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProducts, saveProduct, duplicateProduct, deleteProduct, saveServerProducts } from "@/lib/db/store";
import { Product, ProductStatus, ProductImage } from "@/types";
import { formatMAD, compressImageFile } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  Plus,
  Edit2,
  Copy,
  Trash2,
  Search,
  ExternalLink,
  Check,
  X,
  Camera,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  Loader2,
  RefreshCw,
} from "lucide-react";

// Catalog photo presets available in public/images/products/
const CATALOG_PRESET_IMAGES = [
  {
    url: "/images/products/cognac-minimalist.jpg",
    title: "Royal Cognac",
    desc: "Portefeuille Royal Cognac",
  },
  {
    url: "/images/products/passport-cover.jpg",
    title: "Passport Havana",
    desc: "Protège-Passeport Havana",
  },
  {
    url: "/images/products/bifold-morocco.jpg",
    title: "Bifold Classique",
    desc: "Portefeuille Bifold Vintage",
  },
  {
    url: "/images/products/black-snap-wallet.jpg",
    title: "Snap Noir",
    desc: "Porte-cartes Snap Noir",
  },
  {
    url: "/images/products/altaj-classic-brown-front.jpg",
    title: "Classic Marron",
    desc: "Vue frontale marron",
  },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quick Image Modal State
  const [imageModalProduct, setImageModalProduct] = useState<Product | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [customUrlInput, setCustomUrlInput] = useState<string>("");
  const [imageTab, setImageTab] = useState<"UPLOAD" | "URL" | "PRESETS">("UPLOAD");
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const loadProducts = async () => {
    // 1. Initial display from cache
    const local = getProducts();
    if (local && local.length > 0) {
      setProducts(local);
    }

    // 2. Fetch latest synced products from Supabase / server
    setIsLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const serverProds = await res.json();
        if (Array.isArray(serverProds) && serverProds.length > 0) {
          setProducts(serverProds);
          saveServerProducts(serverProds);
        }
      }
    } catch (e) {
      console.warn("Could not fetch remote products:", e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDuplicate = async (id: string) => {
    const clone = duplicateProduct(id);
    if (clone) {
      setProducts((prev) => [clone, ...prev]);
      try {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clone),
        });
      } catch {}
      showToast(`Produit dupliqué avec succès : ${clone.name}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer ce produit du catalogue ?")) {
      deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      try {
        await fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      } catch {}
      showToast("Produit supprimé du catalogue.");
    }
  };

  const handleOpenAdd = () => {
    const defaultImg = "/images/products/altaj-classic-brown-front.jpg";
    setEditingProduct({
      id: "",
      slug: "",
      name: "",
      sku: `ALTAJ-${Math.floor(100 + Math.random() * 900)}`,
      tagline: "",
      description: "",
      price: 119,
      compareAtPrice: 169,
      cost: 50,
      promotionBadge: "PROMO",
      images: [
        {
          id: `img-${Date.now()}-1`,
          url: defaultImg,
          alt: "Image principale",
          isFeatured: true,
          order: 1,
        },
      ],
      featuredImage: defaultImg,
      stock: 20,
      lowStockThreshold: 5,
      category: "Portefeuilles",
      tags: ["100% Cuir Naturel"],
      status: "ACTIVE",
      materials: ["100% Cuir Naturel Tannage Végétal", "Fil ciré haute résistance"],
      dimensions: "10.8 cm x 8.4 cm",
      handmadeIn: "Atelier ALTAJ — Maroc",
      bundleOffers: [
        {
          id: `b-${Date.now()}-1`,
          name: "1 Portefeuille",
          quantity: 1,
          price: 129,
          badge: "PRIX UNITAIRE",
          savings: 60,
        },
        {
          id: `b-${Date.now()}-2`,
          name: "2 Portefeuilles (Pack Duo)",
          quantity: 2,
          price: 189,
          badge: "MEILLEURE OFFRE — LIVRAISON GRATUITE",
          savings: 189,
          isPopular: true,
        },
      ],
      relatedProductSlugs: [],
      seoTitle: "",
      seoDescription: "",
      rating: 5.0,
      reviewCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct({ ...p });
    setIsModalOpen(true);
  };

  // Open Quick Image Edit Modal
  const handleOpenQuickImageModal = (p: Product) => {
    setImageModalProduct(p);
    setSelectedImageUrl(p.featuredImage || p.images[0]?.url || "/images/products/cognac-minimalist.jpg");
    setCustomUrlInput(p.featuredImage || "");
    setImageTab("UPLOAD");
  };

  // Handle file upload with client-side canvas compression (~30-60 KB)
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "QUICK" | "MAIN" | "GALLERY"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      // Automatically optimize any heavy camera/smartphone photo to max 800x800 JPEG (~30-60 KB)
      // This ensures localStorage quota will never be exceeded.
      const optimizedDataUrl = await compressImageFile(file, 800, 800, 0.75);

      if (target === "QUICK") {
        setSelectedImageUrl(optimizedDataUrl);
        setCustomUrlInput(optimizedDataUrl);
        showToast("Photo optimisée & chargée ! Cliquez sur 'Enregistrer l'image'.");
      } else if (target === "MAIN" && editingProduct) {
        const newImg: ProductImage = {
          id: `img-${Date.now()}`,
          url: optimizedDataUrl,
          alt: editingProduct.name || "Photo produit",
          isFeatured: true,
          order: 1,
        };
        const updatedImages = [
          newImg,
          ...editingProduct.images.map((img) => ({ ...img, isFeatured: false })),
        ];
        setEditingProduct({
          ...editingProduct,
          featuredImage: optimizedDataUrl,
          images: updatedImages,
        });
        showToast("Photo optimisée & définie comme image principale !");
      } else if (target === "GALLERY" && editingProduct) {
        const newImg: ProductImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          url: optimizedDataUrl,
          alt: editingProduct.name || "Photo produit",
          isFeatured: editingProduct.images.length === 0,
          order: editingProduct.images.length + 1,
        };
        const updatedImages = [...editingProduct.images, newImg];
        setEditingProduct({
          ...editingProduct,
          featuredImage: editingProduct.featuredImage || optimizedDataUrl,
          images: updatedImages,
        });
        showToast("Photo ajoutée à la galerie !");
      }
    } catch (err) {
      console.error("Compression error:", err);
      showToast("Erreur lors de l'optimisation de la photo.");
    } finally {
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  // Save from Quick Image Modal
  const handleSaveQuickImage = () => {
    if (!imageModalProduct || !selectedImageUrl) return;

    try {
      const existingImages = imageModalProduct.images || [];
      const imageExists = existingImages.some((img) => img.url === selectedImageUrl);

      let updatedImages: ProductImage[];
      if (imageExists) {
        updatedImages = existingImages.map((img) => ({
          ...img,
          isFeatured: img.url === selectedImageUrl,
        }));
      } else {
        updatedImages = [
          {
            id: `img-${Date.now()}`,
            url: selectedImageUrl,
            alt: imageModalProduct.name,
            isFeatured: true,
            order: 1,
          },
          ...existingImages.map((img) => ({ ...img, isFeatured: false })),
        ];
      }

      const updatedProduct: Product = {
        ...imageModalProduct,
        featuredImage: selectedImageUrl,
        images: updatedImages,
        updatedAt: new Date().toISOString(),
      };

      saveProduct(updatedProduct);
      loadProducts();
      setImageModalProduct(null);
      showToast(`Image principale mise à jour pour : ${updatedProduct.name}`);
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'enregistrement de l'image.");
    }
  };

  // Delete the selected image in Quick Image modal
  const handleDeleteFromQuickModal = () => {
    if (!imageModalProduct) return;
    const filteredImages = (imageModalProduct.images || []).filter(
      (img) => img.url !== selectedImageUrl
    );
    const newFeatured = filteredImages.length > 0 ? filteredImages[0].url : "";
    const updatedProduct: Product = {
      ...imageModalProduct,
      featuredImage: newFeatured,
      images: filteredImages.map((img, i) => ({
        ...img,
        isFeatured: i === 0,
      })),
      updatedAt: new Date().toISOString(),
    };
    saveProduct(updatedProduct);
    loadProducts();
    setImageModalProduct(null);
    showToast("Photo supprimée avec succès !");
  };

  // Set an existing gallery image as default/featured inside main modal
  const handleSetFeaturedInMain = (url: string) => {
    if (!editingProduct) return;
    const exists = editingProduct.images.some((img) => img.url === url);
    let updatedImages: ProductImage[];
    if (exists) {
      updatedImages = editingProduct.images.map((img) => ({
        ...img,
        isFeatured: img.url === url,
      }));
    } else {
      updatedImages = [
        {
          id: `img-${Date.now()}`,
          url,
          alt: editingProduct.name,
          isFeatured: true,
          order: 1,
        },
        ...editingProduct.images.map((img) => ({ ...img, isFeatured: false })),
      ];
    }
    const reordered = [
      ...updatedImages.filter((img) => img.url === url),
      ...updatedImages.filter((img) => img.url !== url),
    ];
    setEditingProduct({
      ...editingProduct,
      featuredImage: url,
      images: reordered,
    });
    showToast("Photo définie comme principale par défaut ★");
  };

  // Delete the currently featured image directly
  const handleDeleteFeaturedImage = () => {
    if (!editingProduct) return;
    const filtered = editingProduct.images.filter(
      (img) => img.url !== editingProduct.featuredImage
    );
    const newFeatured = filtered.length > 0 ? filtered[0].url : "";
    setEditingProduct({
      ...editingProduct,
      featuredImage: newFeatured,
      images: filtered.map((img, i) => ({
        ...img,
        isFeatured: i === 0,
      })),
    });
    showToast("Photo principale supprimée.");
  };

  // Remove an image from gallery in main modal
  const handleRemoveGalleryImage = (imgId: string) => {
    if (!editingProduct) return;
    const filtered = editingProduct.images.filter((img) => img.id !== imgId);
    const newFeatured = filtered.length > 0
      ? (filtered.find((img) => img.isFeatured)?.url || filtered[0].url)
      : "";
    setEditingProduct({
      ...editingProduct,
      featuredImage: newFeatured,
      images: filtered.map((img, i) => ({
        ...img,
        isFeatured: img.url === newFeatured,
      })),
    });
    showToast("Photo supprimée de la galerie.");
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSaving(true);
    const productId = editingProduct.id?.trim() ? editingProduct.id : `prod-${Date.now()}`;
    const slug = (editingProduct.slug?.trim() ? editingProduct.slug : editingProduct.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `produit-${Date.now()}`;

    const toSave: Product = {
      ...editingProduct,
      id: productId,
      slug,
      featuredImage:
        editingProduct.featuredImage ||
        editingProduct.images[0]?.url ||
        "/images/products/cognac-minimalist.jpg",
      updatedAt: new Date().toISOString(),
    };

    // 1. Immediately save locally & update state so user sees it right away
    const saved = saveProduct(toSave);
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });

    setIsModalOpen(false);
    setEditingProduct(null);

    // 2. Persist to API & Supabase
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saved),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.product) {
          setProducts((prev) => {
            const idx = prev.findIndex((p) => p.id === data.product.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = data.product;
              return copy;
            }
            return [data.product, ...prev];
          });
        }
      }
    } catch (err) {
      console.warn("API product save warning:", err);
    } finally {
      setIsSaving(false);
    }

    showToast("Produit et visuel enregistrés avec succès dans le catalogue !");
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-emerald-950 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 border border-emerald-500/30 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-altaj-gold">
            Catalogue ALTAJ
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-altaj-dark uppercase">
            PRODUITS ({products.length})
          </h1>
          <p className="text-xs text-altaj-muted mt-0.5">
            Gestion du catalogue : modification des photos, prix, stocks et offres bundles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadProducts}
            disabled={isLoadingProducts}
            className="p-2 sm:px-3 sm:py-2 rounded-lg bg-white border border-[#DECDBB] text-slate-700 hover:bg-[#FAF4EC] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Synchroniser avec la base de données Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingProducts ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          <Button variant="gold" size="md" className="flex items-center gap-2 shadow-sm" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4" />
            <span>Ajouter un produit</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-sm border border-altaj-border shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-altaj-muted" />
          <input
            type="text"
            placeholder="Rechercher un portefeuille par nom ou SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-altaj-sand/30 border border-altaj-border pl-9 pr-4 py-2 text-xs rounded-sm focus:outline-none focus:border-altaj-brown"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-sm border border-altaj-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-altaj-sand/50 border-b border-altaj-border text-[10px] uppercase font-bold text-altaj-dark">
              <tr>
                <th className="p-3.5">Photo & Produit</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Prix Vente</th>
                <th className="p-3.5">Prix Barré</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Statut</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-altaj-border/60">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-altaj-sand/20 transition-colors group">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      {/* Interactive Thumbnail with Camera Overlay */}
                      <button
                        onClick={() => handleOpenQuickImageModal(p)}
                        className="relative h-14 w-14 flex-shrink-0 bg-altaj-sand rounded-sm overflow-hidden border border-altaj-border group/thumb text-left focus:outline-none focus:ring-2 focus:ring-altaj-gold"
                        title="Cliquez pour changer la photo de ce produit"
                      >
                        <Image
                          src={p.featuredImage || p.images[0]?.url || "/images/products/altaj-classic-brown-front.jpg"}
                          alt={p.name}
                          fill
                          className="object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                          <Camera className="h-4 w-4 mb-0.5" />
                          <span className="text-[8px] font-bold uppercase tracking-wider">Modifier</span>
                        </div>
                      </button>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="font-serif font-bold text-altaj-dark hover:text-altaj-brown flex items-center gap-1"
                          >
                            <span>{p.name}</span>
                            <ExternalLink className="h-3 w-3 text-altaj-muted" />
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-altaj-muted">{p.category}</span>
                          <span className="text-slate-300">•</span>
                          <button
                            onClick={() => handleOpenQuickImageModal(p)}
                            className="text-[10px] font-semibold text-altaj-gold hover:underline flex items-center gap-1"
                          >
                            <Camera className="h-2.5 w-2.5" />
                            <span>Changer l'image ({p.images?.length || 1} photo{p.images?.length > 1 ? "s" : ""})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-altaj-muted">{p.sku}</td>
                  <td className="p-3.5 font-serif font-bold text-altaj-dark">{formatMAD(p.price)}</td>
                  <td className="p-3.5 text-altaj-muted line-through">
                    {p.compareAtPrice ? formatMAD(p.compareAtPrice) : "—"}
                  </td>
                  <td className="p-3.5 font-bold text-altaj-dark">{p.stock} unités</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase ${
                        p.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-900"
                          : p.status === "OUT OF STOCK"
                          ? "bg-rose-100 text-rose-900"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Dedicated Edit Image Button */}
                      <button
                        onClick={() => handleOpenQuickImageModal(p)}
                        className="p-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-sm text-amber-900"
                        title="Changer la photo"
                      >
                        <Camera className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 bg-altaj-sand hover:bg-altaj-border rounded-sm"
                        title="Modifier les détails complets"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(p.id)}
                        className="p-1.5 bg-altaj-sand hover:bg-altaj-border rounded-sm"
                        title="Dupliquer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-sm text-altaj-crimson"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: QUICK IMAGE EDIT MODAL */}
      {/* ========================================================================= */}
      {imageModalProduct && (
        <div className="fixed inset-0 z-50 bg-altaj-dark/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-lg border border-altaj-border shadow-2xl p-6 space-y-5 my-8 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-altaj-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-altaj-gold flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  <span>Gestionnaire Visuel</span>
                </span>
                <h3 className="font-serif text-lg font-bold text-altaj-dark">
                  Modifier l'image de : {imageModalProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setImageModalProduct(null)}
                className="text-altaj-muted hover:text-altaj-dark p-1 rounded-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Current & Preview Box */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-[#FAF8F5] rounded-lg border border-altaj-border/60">
              <div className="relative h-32 w-32 flex-shrink-0 bg-white rounded-md overflow-hidden border-2 border-altaj-gold shadow-md">
                <Image
                  src={selectedImageUrl || "/images/products/altaj-classic-brown-front.jpg"}
                  alt="Aperçu de la nouvelle image"
                  fill
                  className="object-cover"
                />
                <span className="absolute bottom-1 right-1 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                  Aperçu
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-center sm:text-left flex-1">
                <div className="font-bold text-altaj-dark text-sm">
                  Image sélectionnée
                </div>
                <p className="text-[11px] text-slate-500 break-all font-mono">
                  {selectedImageUrl.startsWith("data:")
                    ? "Photo importée depuis votre appareil (Fichier local)"
                    : selectedImageUrl}
                </p>
                <div className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded inline-block border border-emerald-200">
                  ✓ Prête à être définie comme photo principale du produit
                </div>
              </div>
            </div>

            {/* Image Selection Tabs */}
            <div className="space-y-3">
              <div className="flex border-b border-altaj-border gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setImageTab("UPLOAD")}
                  className={`pb-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                    imageTab === "UPLOAD"
                      ? "border-altaj-gold text-altaj-dark"
                      : "border-transparent text-altaj-muted hover:text-altaj-dark"
                  }`}
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Importer un fichier</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab("PRESETS")}
                  className={`pb-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                    imageTab === "PRESETS"
                      ? "border-altaj-gold text-altaj-dark"
                      : "border-transparent text-altaj-muted hover:text-altaj-dark"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Photos Atelier ALTAJ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab("URL")}
                  className={`pb-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                    imageTab === "URL"
                      ? "border-altaj-gold text-altaj-dark"
                      : "border-transparent text-altaj-muted hover:text-altaj-dark"
                  }`}
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>Lien URL direct</span>
                </button>
              </div>

              {/* Tab 1: Upload File */}
              {imageTab === "UPLOAD" && (
                <div className="space-y-3 text-xs">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "QUICK")}
                    className="hidden"
                  />
                  <div
                    onClick={() => !isCompressing && fileInputRef.current?.click()}
                    className={`border-2 border-dashed border-altaj-gold/60 bg-amber-50/20 p-6 rounded-lg text-center transition-colors space-y-2 ${
                      isCompressing
                        ? "cursor-wait opacity-80"
                        : "cursor-pointer hover:border-altaj-gold hover:bg-amber-50/50"
                    }`}
                  >
                    {isCompressing ? (
                      <div className="py-2 flex flex-col items-center justify-center space-y-2 text-altaj-gold">
                        <Loader2 className="h-8 w-8 animate-spin text-altaj-gold" />
                        <span className="font-bold text-xs text-altaj-dark">
                          Optimisation & compression de l'image...
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Format optimisé automatiquement (30-60 Ko) sans perte de qualité
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="font-bold text-altaj-dark block">
                            Cliquez pour choisir une photo sur votre appareil
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Prend en charge JPG, PNG, WEBP de haute qualité.
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                        >
                          Parcourir les fichiers
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Catalog Presets */}
              {imageTab === "PRESETS" && (
                <div className="space-y-2 text-xs">
                  <p className="text-slate-600 text-[11px]">
                    Sélectionnez l'un des clichés officiels de maroquinerie ALTAJ :
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {CATALOG_PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedImageUrl(preset.url);
                          setCustomUrlInput(preset.url);
                        }}
                        className={`p-2 rounded-lg border text-left transition-all relative ${
                          selectedImageUrl === preset.url
                            ? "border-altaj-gold bg-amber-50/50 ring-2 ring-altaj-gold"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="relative h-20 w-full rounded overflow-hidden bg-slate-100 mb-1.5">
                          <Image src={preset.url} alt={preset.title} fill className="object-cover" />
                          {selectedImageUrl === preset.url && (
                            <div className="absolute top-1 right-1 bg-altaj-gold text-white rounded-full p-0.5 shadow">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        <div className="font-bold text-[11px] text-altaj-dark truncate">
                          {preset.title}
                        </div>
                        <div className="text-[9px] text-slate-500 truncate">
                          {preset.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Direct URL */}
              {imageTab === "URL" && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-altaj-dark mb-1">
                      URL web ou chemin relatif de l'image
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://... ou /images/products/..."
                        value={customUrlInput}
                        onChange={(e) => {
                          setCustomUrlInput(e.target.value);
                          if (e.target.value.trim()) {
                            setSelectedImageUrl(e.target.value.trim());
                          }
                        }}
                        className="w-full bg-white border border-altaj-border px-3 py-2 text-xs rounded font-mono focus:outline-none focus:border-altaj-brown"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedImageUrl(customUrlInput.trim())}
                      >
                        Prévisualiser
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Also show current gallery images if multiple exist */}
              {imageModalProduct.images && imageModalProduct.images.length > 1 && (
                <div className="pt-2 border-t border-altaj-border space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Photos existantes dans la galerie de ce produit :
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {imageModalProduct.images.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => {
                          setSelectedImageUrl(img.url);
                          setCustomUrlInput(img.url);
                        }}
                        className={`relative h-14 w-14 rounded overflow-hidden flex-shrink-0 border-2 transition-all ${
                          selectedImageUrl === img.url
                            ? "border-altaj-gold ring-2 ring-altaj-gold"
                            : "border-slate-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image src={img.url} alt={img.alt} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-altaj-border">
              {selectedImageUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleDeleteFromQuickModal}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                  <span>Supprimer cette photo</span>
                </Button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setImageModalProduct(null)}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  variant="gold"
                  size="md"
                  onClick={handleSaveQuickImage}
                  className="flex items-center gap-1.5 shadow"
                >
                  <Check className="h-4 w-4" />
                  <span>Enregistrer l'image</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FULL PRODUCT ADD / EDIT MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-altaj-dark/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-sm border border-altaj-border shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-altaj-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-altaj-gold">
                  Fiche Article
                </span>
                <h3 className="font-serif text-lg font-bold uppercase text-altaj-dark">
                  {editingProduct.id ? "Modifier le produit & les visuels" : "Ajouter un produit"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-altaj-muted hover:text-altaj-dark"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              {/* Product Name & Tagline */}
              <div className="space-y-3">
                <Input
                  label="Nom du produit"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  required
                />
                <Input
                  label="Accroche commerciale (Tagline)"
                  value={editingProduct.tagline || ""}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, tagline: e.target.value })
                  }
                  placeholder="Ex : Conçu pour vos devises marocaines et cartes essentielles"
                />
              </div>

              {/* SKU & Status */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Référence SKU"
                  value={editingProduct.sku}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, sku: e.target.value })
                  }
                  required
                />
                <Select
                  label="Statut"
                  value={editingProduct.status}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      status: e.target.value as ProductStatus,
                    })
                  }
                  options={[
                    { value: "ACTIVE", label: "ACTIVE (Visible sur la boutique)" },
                    { value: "DRAFT", label: "DRAFT (Brouillon)" },
                    { value: "OUT OF STOCK", label: "OUT OF STOCK (Épuisé)" },
                  ]}
                />
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Prix de vente (DH)"
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
                <Input
                  label="Prix barré (DH)"
                  type="number"
                  value={editingProduct.compareAtPrice || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      compareAtPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                <Input
                  label="Stock actuel"
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              {/* ============================================================= */}
              {/* PRODUCT IMAGES & GALLERY SECTION */}
              {/* ============================================================= */}
              <div className="p-4 bg-[#FAF8F5] rounded-lg border border-altaj-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-altaj-gold" />
                    <span className="font-bold text-altaj-dark text-xs uppercase tracking-wider">
                      Photos & Visuels du Produit
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {editingProduct.images.length} photo{editingProduct.images.length > 1 ? "s" : ""} dans la galerie
                  </span>
                </div>

                {/* Primary Featured Image Display */}
                <div className="flex items-start gap-4 p-3 bg-white rounded-md border border-slate-200">
                  <div className="relative h-24 w-24 rounded overflow-hidden flex-shrink-0 bg-slate-100 border-2 border-altaj-gold shadow-sm">
                    <Image
                      src={
                        editingProduct.featuredImage ||
                        editingProduct.images[0]?.url ||
                        "/images/products/altaj-classic-brown-front.jpg"
                      }
                      alt="Image principale"
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-1 left-1 right-1 bg-altaj-gold text-white text-[8px] font-bold text-center py-0.5 rounded shadow">
                      ★ Principale
                    </span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-altaj-gold block">
                        Photo Principale (Catalogue & Miniatures)
                      </span>
                      <p className="text-[11px] text-slate-600 font-mono truncate max-w-sm">
                        {editingProduct.featuredImage}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        ref={modalFileInputRef}
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "MAIN")}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="gold"
                        size="sm"
                        disabled={isCompressing}
                        className="text-xs flex items-center gap-1.5"
                        onClick={() => modalFileInputRef.current?.click()}
                      >
                        {isCompressing ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Optimisation...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="h-3.5 w-3.5" />
                            <span>{editingProduct.featuredImage ? "Remplacer la photo" : "Importer une photo"}</span>
                          </>
                        )}
                      </Button>

                      {editingProduct.featuredImage && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleDeleteFeaturedImage}
                          className="text-xs text-rose-600 border-rose-300 hover:bg-rose-50 flex items-center gap-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                          <span>Supprimer</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preset quick buttons */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Ou sélectionner une photo haute définition ALTAJ :
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {CATALOG_PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSetFeaturedInMain(preset.url)}
                        className={`p-1 rounded border text-left transition-all ${
                          editingProduct.featuredImage === preset.url
                            ? "border-altaj-gold bg-amber-50 ring-2 ring-altaj-gold"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="relative h-12 w-full rounded overflow-hidden bg-slate-100 mb-1">
                          <Image src={preset.url} alt={preset.title} fill className="object-cover" />
                        </div>
                        <div className="text-[9px] font-bold text-altaj-dark truncate">
                          {preset.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Gallery List */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Galerie Photos ({editingProduct.images.length}) :
                    </span>
                    <input
                      type="file"
                      ref={galleryFileInputRef}
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "GALLERY")}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="text-xs h-7 px-2.5 flex items-center gap-1 text-altaj-gold border-altaj-gold/40 hover:bg-amber-50"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Ajouter une photo</span>
                    </Button>
                  </div>

                  {editingProduct.images.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400 bg-white rounded border border-dashed border-slate-300">
                      Aucune photo dans la galerie. Cliquez sur « Ajouter une photo » ci-dessus.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {editingProduct.images.map((img, idx) => (
                        <div
                          key={img.id || idx}
                          className="flex items-center justify-between gap-3 p-2 bg-white rounded border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0 bg-slate-100 border">
                              <Image src={img.url} alt={img.alt || "Photo"} fill className="object-cover" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-altaj-dark truncate text-[11px]">
                                Photo #{idx + 1} {img.url === editingProduct.featuredImage && "(★ En vedette)"}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs">
                                {img.url}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {img.url !== editingProduct.featuredImage ? (
                              <button
                                type="button"
                                onClick={() => handleSetFeaturedInMain(img.url)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[10px] font-bold rounded border border-amber-300 flex items-center gap-1 shadow-2xs transition-colors"
                              >
                                <span>★ Définir par défaut</span>
                              </button>
                            ) : (
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded border border-emerald-300 flex items-center gap-1">
                                <span>★ Par défaut ✓</span>
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(img.id)}
                              className="px-2 py-1 text-rose-600 hover:text-white hover:bg-rose-600 rounded border border-rose-200 hover:border-rose-600 transition-colors flex items-center gap-1 text-[10px] font-bold"
                              title="Supprimer cette photo de la galerie"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-altaj-border">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="gold" size="md" disabled={isSaving}>
                  {isSaving ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </span>
                  ) : (
                    <span>Enregistrer le produit</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
