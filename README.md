# Blog Nemoscit - Générateur de site statique

Générateur de blog simple qui convertit des fichiers Markdown en pages HTML avec détection automatique des modifications.

## 🚀 Utilisation

```bash
# Installation
npm install

# Génération unique
npm run build

# Mode surveillance continue
npm run watch
```

## 📝 Ajouter un article

1. Créez un fichier Markdown dans `articles/`
2. Nommez-le : `YYYY-MM-DD-categorie-titre.md`
3. Commencez par un titre H1 (`# Mon titre`) ou H2 (`## Mon titre`)
4. Lancez : `npm run build`

### Catégories
- `livres` - Critiques de livres
- `essais` - Réflexions et essais
- `critiques` - Critiques d'art, films, etc.
- `autres` - Divers

## ✨ Fonctionnalités

- ✅ Conversion automatique Markdown → HTML
- ✅ Extraction du titre depuis le premier H1/H2
- ✅ Pages individuelles pour chaque article
- ✅ Tri chronologique automatique
- ✅ Détection des modifications avec dates de mise à jour
- ✅ Mode watch pour le développement
- ✅ Design responsive et moderne
- ✅ Navigation complète entre les pages
- ✅ Mode sombre/clair

## 📁 Structure

```
blog-nemoscit/
├── articles/           # Fichiers Markdown
├── clean_and_build.js  # Script de génération
├── styles.css         # Styles CSS
├── index.html         # Page d'accueil (générée)
├── livres.html        # Pages catégories (générées)
├── essais.html
├── critiques.html
├── autres.html
└── package.json       # Configuration npm
```

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