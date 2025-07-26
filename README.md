# Blog Nemoscit - Générateur de site statique

Un générateur de blog simple qui convertit des fichiers Markdown en pages HTML avec détection automatique des modifications.

## 🚀 Utilisation rapide

### Installation
```bash
npm install
```

### Génération du site
```bash
# Génération unique
npm run build

# Mode watch (surveillance continue)
npm run watch
```

## 📝 Comment ajouter un article

1. **Créez un fichier Markdown** dans le dossier `articles/`
2. **Nommez-le** : `YYYY-MM-DD-categorie-titre.md`
   - Exemple : `2024-05-01-livres-mon-article.md`
3. **Commencez par un titre** H1 (`# Mon titre`) ou H2 (`## Mon titre`)
4. **Lancez la génération** : `npm run build`

### Catégories disponibles
- `livres` - Critiques de livres
- `essais` - Réflexions et essais
- `critiques` - Critiques d'art, films, etc.
- `autres` - Divers

## ✨ Fonctionnalités

- ✅ **Conversion automatique** Markdown → HTML
- ✅ **Extraction du titre** depuis le premier H1/H2
- ✅ **Pages individuelles** pour chaque article
- ✅ **Tri chronologique** automatique
- ✅ **Détection des modifications** avec dates de mise à jour
- ✅ **Mode watch** pour le développement
- ✅ **Design responsive** et moderne
- ✅ **Navigation complète** entre les pages

## 📁 Structure du projet

```
blog-nemoscit/
├── articles/           # Fichiers Markdown
├── clean_and_build.js  # Script de génération
├── styles.css         # Styles CSS
├── index.html         # Page d'accueil (générée)
├── livres.html        # Page catégorie (générée)
├── essais.html        # Page catégorie (générée)
├── critiques.html     # Page catégorie (générée)
├── autres.html        # Page catégorie (générée)
└── package.json       # Configuration npm
```

## 🔧 Scripts disponibles

- `npm run build` - Génère le site une fois
- `npm run watch` - Mode surveillance continue
- `npm run dev` - Alias pour le mode watch

## 📖 Exemple d'article

```markdown
# Mon premier article

Ceci est le contenu de mon article. Je peux utiliser **du gras**, *de l'italique*, des listes :

- Point 1
- Point 2

## Sous-section
Et même des images :

![Texte alternatif](chemin/vers/image.jpg)
```

## 🛠️ Dépendances

- [Node.js](https://nodejs.org/)
- [marked](https://www.npmjs.com/package/marked) - Conversion Markdown

## 📝 Notes

- Les fichiers HTML sont générés automatiquement
- Le cache des métadonnées est stocké dans `.articles-metadata.json`
- Le mode watch surveille le dossier `articles/` en temps réel 