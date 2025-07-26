const fs = require('fs');
const path = require('path');
const marked = require('marked');

// Configuration de marked pour préserver les sauts de ligne
marked.setOptions({
  breaks: true,
  gfm: true
});

const ARTICLES_DIR = 'articles';
const INDEX_HTML = 'index.html';
const CATEGORIES = ['livres', 'essais', 'critiques', 'autres'];

function parseFilename(filename) {
  // Ex: 2024-05-01-livres-mon-article.md
  const m = filename.match(/^(\d{4}-\d{2}-\d{2})-([a-z]+)-(.+)\.md$/);
  if (!m) return null;
  const [_, dateStr, category, slug] = m;
  if (!CATEGORIES.includes(category)) return null;
  return { date: new Date(dateStr), category, slug, filename };
}

function extractTitleFromMarkdown(content) {
  // Cherche le premier titre H1 (# Titre)
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  // Si pas de H1, cherche H2 (## Titre)
  const titleMatch2 = content.match(/^##\s+(.+)$/m);
  if (titleMatch2) {
    return titleMatch2[1].trim();
  }
  // Sinon utilise le slug comme titre
  return null;
}

function createArticlePage(article) {
  const template = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${article.title} - Blog Nemoscit</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
<header>
  <div class="header-content">
    <h1 class="site-title"><a href="index.html" style="text-decoration: none; color: inherit;">Blog Nemoscit</a></h1>
    <nav class="main-nav">
      <a href="essais.html" class="nav-link">Essais</a>
      <a href="critiques.html" class="nav-link">Critiques</a>
      <a href="livres.html" class="nav-link">Livres</a>
      <a href="autres.html" class="nav-link">Autres</a>
    </nav>
  </div>
</header>
<main>
  <article class="article-full" style="max-width: 800px; margin: 3rem auto; padding: 0 2rem;">
    <header class="article-header">
      <h1 class="article-title">${article.title}</h1>
      <time class="article-date">${article.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</time>
    </header>
    <div class="article-content">
      ${article.html}
    </div>
  </article>
</main>
<footer>
  <div class="footer-content">
    <nav class="footer-nav">
      <a href="index.html" class="footer-link">Accueil</a>
      <a href="contact.html" class="footer-link">Contact</a>
      <a href="a-propos.html" class="footer-link">À propos</a>
    </nav>
    <p class="footer-text">&copy; 2024 Blog Minimaliste. Tous droits réservés.</p>
  </div>
</footer>
</body>
</html>`;

  const articleFilename = `${article.slug}.html`;
  fs.writeFileSync(articleFilename, template, 'utf-8');
  return articleFilename;
}

function getArticles() {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  const files = fs.readdirSync(ARTICLES_DIR);
  const articles = [];
  for (const fname of files) {
    if (fname.endsWith('.md')) {
      const meta = parseFilename(fname);
      if (meta) {
        const content = fs.readFileSync(path.join(ARTICLES_DIR, fname), 'utf-8');
        const html = marked.parse(content);
        const title = extractTitleFromMarkdown(content) || meta.slug.replace(/-/g, ' ');
        articles.push({ ...meta, html, title });
      }
    }
  }
  // Tri du plus récent au plus ancien
  articles.sort((a, b) => b.date - a.date);
  return articles;
}

function injectArticles(articles) {
  let html = fs.readFileSync(INDEX_HTML, 'utf-8');
  // Trouve la div articles-grid
  const pattern = /(<div class="articles-grid">)(.*?)(<\/div>)/s;
  const m = html.match(pattern);
  if (!m) {
    console.error("Impossible de trouver la section articles-grid dans index.html");
    return;
  }
  
  // Génère le HTML pour chaque article
  let articlesHtml = '';
  for (const art of articles) {
    const articlePage = createArticlePage(art);
    // Crée un extrait propre (sans HTML, max 150 caractères)
    const excerpt = art.html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().substring(0, 150);
    articlesHtml += `\n<article class="article-card" data-category="${art.category}">\n  <div class="article-content">\n    <h3 class="article-title"><a href="${articlePage}" style="text-decoration: none; color: inherit;">${art.title}</a></h3>\n    <p class="article-excerpt">${excerpt}${excerpt.length >= 150 ? '...' : ''}</p>\n    <div class="article-date">${art.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>\n  </div>\n</article>\n`;
  }
  
  // Remplace le contenu
  html = html.replace(pattern, `$1\n${articlesHtml}\n$3`);
  fs.writeFileSync(INDEX_HTML, html, 'utf-8');
  console.log('Articles injectés dans index.html !');
}

const articles = getArticles();
injectArticles(articles); 