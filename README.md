# Essentiel : thème Shopify

Thème Shopify Online Store 2.0, en français et en euros, pour une boutique de vêtements sobre : fond blanc, bandeau d'annonce noir, menu en majuscules, grille de produits épurée avec pastilles de couleur.

Le nom de la marque n'est écrit nulle part dans le code : le thème affiche le **nom de la boutique Shopify** (Paramètres > Détails de la boutique), ou le logo choisi dans l'éditeur.

## Contenu du dépôt

| Dossier | Rôle |
| --- | --- |
| `layout/` | `theme.liquid` (structure de toutes les pages) et `password.liquid` |
| `templates/` | Modèles JSON : accueil, produit, collection, panier, page, `page.contact`, recherche, 404, compte client… |
| `sections/` | Sections modifiables dans l'éditeur, plus les groupes header et footer |
| `snippets/` | Morceaux réutilisables : carte produit, prix, pastilles, contenu du panier, icônes… |
| `assets/` | `base.css` et `theme.js` |
| `config/` | Réglages du thème (couleurs, panier, cartes produits, réseaux sociaux…) |
| `locales/` | Textes de l'interface en français |
| `produits-shopify.csv` | Les 4 t-shirts de départ, à importer dans Shopify |
| `images/`, `tshirt/` | Photos sources (ignorées par Shopify) |

## 1. Installer le thème

Trois façons de faire, au choix :

- **Depuis GitHub (conseillé)** : Boutique en ligne > Thèmes > Ajouter un thème > **Se connecter à GitHub**, puis choisis le dépôt `site_t`, branche `main`. Chaque `git push` met le thème à jour.
- **En .zip** : lance `python tools/build_zip.py`, puis Boutique en ligne > Thèmes > Ajouter un thème > **Importer un fichier zip** avec `dist/essentiel.zip`.
- **Avec Shopify CLI** :

  ```bash
  shopify theme dev --store ta-boutique.myshopify.com
  ```

## 2. Configurer la boutique (une seule fois)

1. **Langue et devise** : Paramètres > Langues : français par défaut. Paramètres > Marchés : euro (EUR). Si plusieurs pays sont activés, le sélecteur de devise apparaît dans le header et le footer.
2. **Importer les produits** : Produits > Importer > `produits-shopify.csv`. Les images viennent directement de ce dépôt GitHub.
3. **Collections** :

   | Titre | Identifiant (handle) | Condition |
   | --- | --- | --- |
   | T-shirts | `t-shirts` | Tag du produit = T-shirts |
   | Hoodies | `hoodies` | Tag du produit = Hoodies |

   La collection « Tous les articles » (`/collections/all`) existe déjà par défaut.
4. **Pages** : Boutique en ligne > Pages : « Contact », identifiant `contact`, modèle **page.contact**.
5. **Politiques** : Paramètres > Politiques : CGV, mentions légales, politique de confidentialité, livraison et retours.
6. **Menus** : Boutique en ligne > Navigation :
   - `main-menu` : Accueil, T-shirts, Hoodies, Tous les articles
   - `footer` : Contact, CGV, Mentions légales, Politique de confidentialité, Livraison et retours
7. **Filtres** : installe l'app gratuite *Shopify Search & Discovery*, puis ajoute les filtres Couleur, Taille et Prix.
8. **Livraison offerte** : Paramètres > Expédition : ajoute un tarif gratuit à partir de 60 €. Le seuil de la barre de progression du panier se règle dans Paramètres du thème > Panier (0 pour la masquer).
9. **Paiement** : active Shopify Payments, ou Stripe comme fournisseur externe. Le thème utilise le checkout Shopify, rien à régler de son côté.
10. **Newsletter** : les inscrits arrivent dans Clients avec le tag `newsletter` et le consentement marketing.

## 3. Personnaliser dans l'éditeur

Boutique en ligne > Thèmes > Personnaliser. Les sections de l'accueil se déplacent, se masquent et se modifient :

- **Bandeau d'annonce** : un bloc par message (les messages défilent en fondu).
- **Header** : logo, menu, sélecteur de devise.
- **Bannière image**, **Grille de produits**, **Liste de collections**, **Services**, **Texte**, **Newsletter**.
- **Paramètres du thème** : couleurs, largeur de page, majuscules des titres, code devise sur les prix, panier, format des images produits, guide des tailles, Instagram et TikTok.

### Photos produits

- Image 1 : face (image principale de la carte)
- Image 2 : dos ou porté (affichée au survol)
- Images suivantes : détails

Les produits importés n'ont qu'un mockup chacun. Ajoute une 2e photo pour activer l'effet au survol.

## Ce que fait le thème

- Accueil : bandeau d'annonce, header (logo, menu, devise, compte, recherche, panier), bannière, nouveautés, collections, services, newsletter, footer.
- Fiche produit : galerie avec vignettes, couleurs et tailles, guide des tailles, ajout au panier en Ajax, onglets Description, Entretien et Livraison, « Vous aimerez aussi ».
- Panier en tiroir latéral via l'API Ajax Cart (`/cart/add.js`, `/cart/change.js` et rendu de sections), avec une barre de progression vers la livraison offerte calculée sur le montant réel du panier.
- Page collection : filtres Shopify (couleur, taille, prix), tri, pagination.
- Pages contact, recherche, 404, blog, compte client et mot de passe.
- Mobile first, sans bibliothèque JS, animations discrètes désactivées si le visiteur préfère moins d'animations, textes alternatifs et navigation au clavier.
