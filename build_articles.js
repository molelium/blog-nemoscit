const fs = require('fs');
const path = require('path');
const marked = require('marked');

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
        articles.push({ ...meta, html });
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
    articlesHtml += `\n<article class="article-card" data-category="${art.category}">\n  <div class="article-content">\n    ${art.html}\n    <div class="article-date">${art.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>\n  </div>\n</article>\n`;
  }
  // Remplace le contenu
  html = html.replace(pattern, `$1\n${articlesHtml}\n$3`);
  fs.writeFileSync(INDEX_HTML, html, 'utf-8');
  console.log('Articles injectés dans index.html !');
}

const articles = getArticles();
injectArticles(articles); 