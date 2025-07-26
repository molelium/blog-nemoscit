# Blog Minimaliste – Publication d'articles Markdown

## Poster un article

1. **Écris ton article en Markdown**
   - Utilise un éditeur de texte (VSCode, Typora, etc.)
   - Sauvegarde-le dans le dossier `articles/` à la racine du projet
   - **Important** : Commence ton article par un titre H1 (`# Mon titre`) ou H2 (`## Mon titre`)

2. **Nom du fichier**
   - Format : `AAAA-MM-JJ-categorie-titre.md`
   - Exemples :
     - `2024-05-01-livres-mon-article.md`
     - `2024-05-02-critiques-un-film.md`
     - `2024-05-03-essais-ma-reflexion.md`
     - `2024-05-04-autres-divers.md`
   - Les catégories valides sont : `livres`, `essais`, `critiques`, `autres`

3. **Publier l'article**
   - Ouvre un terminal à la racine du projet
   - Installe la dépendance si ce n'est pas déjà fait :
     ```bash
     npm install marked
     ```
   - Lance le script :
     ```bash
     node clean_and_build.js
     ```
   - Le script va :
     - Convertir tous les articles `.md` en HTML
     - Extraire automatiquement le titre du premier H1 ou H2
     - Créer une page HTML dédiée pour chaque article
     - Ajouter les articles sur la page d'accueil avec des liens cliquables
     - Trier les articles du plus récent au plus ancien
     - **Nettoyer automatiquement** les fichiers HTML pour éviter les doublons

4. **Navigation**
   - Les articles sur la page d'accueil sont maintenant cliquables
   - Cliquer sur un titre d'article ouvre sa page dédiée
   - Chaque page d'article a sa propre URL (ex: `mon-article.html`)

---

## Exemple de fichier Markdown

```markdown
# Mon premier article
Ceci est le contenu de mon article. Je peux utiliser **du gras**, *de l'italique*, des listes :

- Point 1
- Point 2

## Sous-section
Et même des images :

![Texte alternatif](chemin/vers/image.jpg)
```

**Note** : Le titre principal (`# Mon premier article`) sera automatiquement extrait et utilisé comme titre de l'article.

---

## Fonctionnalités

- ✅ **Extraction automatique du titre** depuis le Markdown
- ✅ **Pages HTML dédiées** pour chaque article
- ✅ **Articles cliquables** sur la page d'accueil
- ✅ **Tri chronologique** automatique
- ✅ **Navigation complète** entre toutes les pages
- ✅ **Design responsive** pour mobile et desktop
- ✅ **Nettoyage automatique** des fichiers HTML
- ✅ **Détection des modifications** avec dates de mise à jour

---

## Dépendances
- [Node.js](https://nodejs.org/)
- [marked](https://www.npmjs.com/package/marked)

---

## Questions ?
N'hésite pas à demander si tu veux une autre organisation ou des fonctionnalités supplémentaires ! 