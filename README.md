# Porte tes idées : thème Shopify

Thème Shopify Online Store 2.0, en français et en euros, pour une marque de t-shirts engagés qui récupère les slogans de la rue (pancartes, stickers, murs, bitume).

Le nom de la marque n'est écrit nulle part dans le code : le thème affiche le **nom de la boutique Shopify** (Paramètres > Détails de la boutique), ou le logo choisi dans l'éditeur.

## Contenu du dépôt

| Dossier | Rôle |
| --- | --- |
| `layout/` | `theme.liquid` (structure de toutes les pages) et `password.liquid` |
| `templates/` | Modèles JSON : accueil, produit, collection, panier, page, `page.manifeste`, `page.contact`, recherche, 404, compte client… |
| `sections/` | Toutes les sections modifiables dans l'éditeur, plus les groupes header et footer |
| `snippets/` | Morceaux réutilisables : carte produit, prix, pastilles, contenu du panier, icônes… |
| `assets/` | `base.css`, `theme.js` et l'image de secours du hero |
| `config/` | Réglages du thème (couleurs, panier, réseaux sociaux…) |
| `locales/` | Textes de l'interface en français |
| `produits-shopify.csv` | Les 4 produits de départ, à importer dans Shopify |
| `images/`, `tshirt/` | Photos sources (ignorées par Shopify) |

## 1. Installer le thème

Il y a trois façons de faire, au choix :

- **Depuis GitHub (conseillé)** : Boutique en ligne > Thèmes > Ajouter un thème > **Se connecter à GitHub**, puis choisis le dépôt `site_t`, branche `main`. Chaque `git push` met le thème à jour.
- **En .zip** : lance `python tools/build_zip.py` (ou récupère `dist/porte-tes-idees.zip`), puis Boutique en ligne > Thèmes > Ajouter un thème > **Importer un fichier zip**.
- **Avec Shopify CLI** :

  ```bash
  shopify theme dev --store ta-boutique.myshopify.com
  ```

  ```bash
  shopify theme push --unpublished
  ```

## 2. Configurer la boutique (une seule fois)

1. **Langue et devise** : Paramètres > Langues : français par défaut. Paramètres > Marchés : euro (EUR).
2. **Metafields produit** : Paramètres > Données personnalisées > Produits > Ajouter une définition :
   - `custom.slogan_origin` : *Texte multiligne*, nom « D'où vient ce slogan ? » (obligatoire pour l'encart de la fiche produit)
   - `custom.slogan_lieu` : *Texte sur une seule ligne*, nom « Lieu du slogan » (facultatif)
   - `custom.slogan_photo` : *Fichier* (images), nom « Photo du slogan » (facultatif, s'affiche comme une photo scotchée)
3. **Importer les produits** : Produits > Importer > `produits-shopify.csv`. Les images viennent directement de ce dépôt GitHub. Relis les textes « D'où vient ce slogan ? » : ils décrivent les photos, complète-les avec le lieu et l'histoire réels.
4. **Collections** : crée 4 collections *automatisées* avec la condition « Tag du produit est égal à… » :

   | Titre | Identifiant (handle) | Tag |
   | --- | --- | --- |
   | Pancartes | `pancartes` | Pancartes |
   | Stickers | `stickers` | Stickers |
   | Murs | `murs` | Murs |
   | Bitume | `bitume` | Bitume |

   Les identifiants comptent : ils donnent à chaque page collection son ambiance (carton, Y2K rose, mur taggé, affiche rouge et jaune).
5. **Pages** : Boutique en ligne > Pages :
   - « Le manifeste », identifiant `manifeste`, modèle **page.manifeste**
   - « Contact », identifiant `contact`, modèle **page.contact**
6. **Politiques** : Paramètres > Politiques : CGV, mentions légales, politique de confidentialité, livraison et retours.
7. **Menus** : Boutique en ligne > Navigation :
   - `main-menu` : Accueil, Collections (`/collections`), Tous les t-shirts (`/collections/all`), Le manifeste
   - `footer` : Contact, CGV, Mentions légales, Politique de confidentialité, Livraison et retours
8. **Filtres** : installe l'app gratuite *Shopify Search & Discovery*, puis ajoute les filtres Couleur, Taille et Prix.
9. **Livraison offerte dès 60 €** : Paramètres > Expédition : ajoute un tarif gratuit avec la condition « prix de commande ≥ 60 € ». Le seuil de la barre de progression du panier se règle dans Paramètres du thème > Panier.
10. **3 achetés = le 4e offert** : Réductions > Créer > *Achetez X, obtenez Y* : 3 articles achetés, 1 offert à 100 %.
11. **Paiement** : active Shopify Payments, ou Stripe comme fournisseur externe. Le thème utilise le checkout Shopify, aucun réglage n'est nécessaire de son côté.
12. **Newsletter** : les inscrits arrivent dans Clients avec le tag `newsletter` et le consentement marketing.

## 3. Personnaliser dans l'éditeur

Boutique en ligne > Thèmes > Personnaliser. Toutes les sections de l'accueil se déplacent, se masquent et se modifient (textes, images, liens, couleurs) :

- **Bandeau défilant** : un bloc par message, couleur et vitesse.
- **Hero** : image (idéalement un t-shirt vu de dos porté dans la rue), titre, bouton.
- **Grille de produits (Le drop)** : collection, nombre de produits, colonnes.
- **Collection à thème** (×4) : ambiance, collection, phrase d'intro, visuel d'ambiance scotché.
- **Manifeste (bandeau)**, **Tu cherches quoi ?**, **Réassurance**, **Newsletter**.
- **Paramètres du thème** : couleurs, rotations « fait main », animations, panier, format des images, guide des tailles, Instagram et TikTok.

### Photos produits

Ordre conseillé des images de chaque produit :

1. **Face** (recto) : image principale de la carte produit
2. **Dos** : affichée au survol de la carte
3. **Porté** : dans la rue

Les photos actuelles sont des mockups de dos. Remplace-les par de vraies photos dès que possible.

## Ce que fait le thème

- Page d'accueil complète : bandeau défilant, hero, drop, 4 collections à thème, manifeste, « Tu cherches quoi ? », réassurance, newsletter, footer.
- Fiche produit : galerie avec vignettes, couleurs et tailles, guide des tailles, ajout au panier en Ajax, encart « D'où vient ce slogan ? » (metafield), onglets matière, entretien et livraison, « Tu aimeras aussi » (recommandations Shopify).
- Panier en tiroir latéral via l'API Ajax Cart (`/cart/add.js`, `/cart/change.js` et rendu de sections), avec une barre de progression vers la livraison offerte calculée sur le montant réel du panier.
- Page collection : filtres Shopify (couleur, taille, prix), tri, pagination.
- Page « Le manifeste » en fanzine : chaque titre, paragraphe, citation, image, sticker ou rubalise est un bloc modifiable.
- Mobile first, sans bibliothèque JS, animations légères désactivées si le visiteur préfère moins d'animations, textes alternatifs et navigation au clavier.
