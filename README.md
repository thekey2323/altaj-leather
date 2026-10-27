# ALTAJLEATHER — Plateforme E-Commerce & Back-Office COD

Plateforme e-commerce haut de gamme et tableau de bord de gestion d'entreprise conçus spécialement pour la marque de maroquinerie artisanale marocaine **ALTAJLEATHER**.

---

## ✨ Points Forts du Projet

### 1. Identité Visuelle & Expérience Utilisateur (UX)
- **Palette Couleurs Spécifique** :
  - Ivoire chaud : `#F7F3ED`
  - Sable lin : `#EEE7DD`
  - Blanc pur : `#FFFFFF`
  - Espresso sombre : `#201B18`
  - Marron cuir d'artisan : `#5A4031`
  - Taupe doux : `#9A7761`
  - Or antique : `#B89563`
  - Anthracite profond : `#24201D`
- **Typographie de Luxe** : En-têtes à empattements (Serif) inspirés de l'architecture marocaine contemporaine et corps de texte sans-serif lisible et fluide.
- **Photographies Authentiques** : Intégration des 5 photos réelles des portefeuilles ALTAJ (Classic Marron, Noir aux piqûres rouges, vue ouverte billets 200 DH & cartes de banque marocaines CIH / BMCE).
- **Mobile-First Intégral** : Bouton d'achat sticky au pouce, tiroir panier fluide, formulaires sans friction.

### 2. Tunnel de Vente Haute Conversion (Moroccan COD)
- **Formulaire COD Ultra-Rapide** : Nom complet, Téléphone (validation marocaine `06`, `07`, `+212`), Ville et Adresse. Aucune création de compte requise.
- **Moteur d'Offres Bundles Dynamiques** : Sélecteur 1 portefeuille vs 2 portefeuilles ("MEILLEURE OFFRE") avec mise à jour automatique des prix, sous-totaux et remises.
- **Barre de Livraison Gratuite** : Calcul dynamique avec seuil paramétrable (ex: gratuit dès 250 DH).
- **Confirmation de Commande & Reçu** : Écran de confirmation avec confettis dorés, numéro de commande `#ALTAJ-XXXX` et bouton direct de validation sur WhatsApp.
- **WhatsApp Flottant** : Bouton d'assistance WhatsApp avec message pré-rempli et voyant de disponibilité en direct.

### 3. Back-Office d'Administration Dédié (`/admin`)
- **Tableau de bord exécutif avec KPIs spécifiques au COD marocain** :
  - Chiffre d'affaires
  - Total des commandes
  - Panier moyen
  - **Taux de Confirmation** = Commandes confirmées / Total commandes
  - **Taux de Livraison Réelle** = Commandes livrées / Commandes expédiées
  - **Taux d'Annulation** = Commandes annulées / Total commandes
  - **Taux de Retour Colis** = Commandes retournées / Commandes expédiées
- **Gestion des Commandes** :
  - Statuts du cycle de vie : `NOUVELLE`, `PENDING_CONFIRMATION`, `CONFIRMED`, `PREPARING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `RETURNED`.
  - Boutons d'appel téléphonique et de message WhatsApp direct pré-rempli par commande.
  - Page détail de commande avec timeline et journal de notes internes (ex: "Client confirmé par WhatsApp").
- **Gestion du Catalogue & Produits** : Création, modification des prix, prix barrés, coûts atelier, calcul de marge brute, upload et sélection d'images.
- **Contrôle de l'Inventaire & Audit Log** : Niveaux de stock, seuils d'alerte, boutons d'ajout/déduction rapides avec saisie du motif et historique horodaté.
- **Base de Données Clients** : Score de fiabilité COD par client (détection des profils à risque d'annulation), total dépensé et récapitulatif des commandes.
- **Moteur d'Offres & Bundles** : Gestionnaire des remises sur volume.
- **Analytique Géographique par Ville** : Suivi des performances de livraison par ville marocaine (Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir...).
- **Attribution Marketing** : Suivi par canal UTM (TikTok Ads, Instagram, Facebook, WhatsApp, Organique, Direct).
- **Éditeur de Contenu CMS** : Modification des textes Hero, annonces, numéro WhatsApp et réseaux sociaux sans toucher au code.
- **Paramètres & Rôles** : Configuration des frais de port, rôles (`OWNER`, `ADMIN`, `STAFF`).
- **Responsive Mobile Admin** : Barre de navigation inférieure dédiée permettant au gérant de confirmer des commandes, appeler les clients et vérifier les stocks depuis son smartphone.

### 4. Base de Données & Extensibilité
- **Schéma PostgreSQL Supabase complet** dans `supabase/schema.sql` (avec clés étrangères, contraintes d'intégrité, indexes de performance et triggers).
- **Couche d'abstraction modulaire** (`lib/db/store.ts`) fonctionnant immédiatement en persistance locale tout en étant prête pour Supabase dès l'ajout des clés API dans `.env.local`.

---

## 🚀 Démarrage du Projet

### Installation & Lancement en Développement
```bash
npm install
npm run dev
```
Accédez au site public : [http://localhost:3000](http://localhost:3000)
Accédez au back-office : [http://localhost:3000/admin](http://localhost:3000/admin)

### Compilation Production
```bash
npm run build
npm run start
```
