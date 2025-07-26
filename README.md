# Blog Minimaliste – Publication d'articles Markdown

## Poster un article

1. **Écris ton article en Markdown**
   - Utilise un éditeur de texte (VSCode, Typora, etc.)
   - Sauvegarde-le dans le dossier `articles/` à la racine du projet

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
     node build_articles.js
     ```
   - Tous les articles `.md` du dossier `articles/` seront convertis en HTML et publiés automatiquement sur la page d'accueil (`index.html`), du plus récent au plus ancien.

4. **Astuces**
   - Utilise la syntaxe Markdown standard pour les titres, listes, images, liens, etc.
   - La date et la catégorie sont extraites du nom du fichier.
   - Pour modifier un article, édite simplement le fichier `.md` puis relance le script.

---

## Exemple de fichier Markdown

```markdown
# Mon premier article
Ceci est le contenu de mon article. Je peux utiliser **du gras**, *de l'italique*, des listes :

- Point 1
- Point 2

Et même des images :

![Texte alternatif](chemin/vers/image.jpg)
```

---

## Dépendances
- [Node.js](https://nodejs.org/)
- [marked](https://www.npmjs.com/package/marked)

---

## Questions ?
N'hésite pas à demander si tu veux une autre organisation ou des fonctionnalités supplémentaires ! 