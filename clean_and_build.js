const fs = require('fs');
const path = require('path');
const marked = require('marked');

// Configuration
marked.setOptions({ breaks: true, gfm: true });

const ARTICLES_DIR = 'articles';
const INDEX_HTML = 'index.html';
const CATEGORIES = ['livres', 'essais', 'critiques', 'autres'];
const METADATA_FILE = '.articles-metadata.json';
const isWatchMode = process.argv.includes('--watch');

// Fonctions utilitaires
function loadMetadata() {
  if (fs.existsSync(METADATA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

function saveMetadata(metadata) {
  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
}

function getFileHash(filepath) {
  const stats = fs.statSync(filepath);
  return stats.mtime.getTime();
}

function parseFilename(filename) {
  const m = filename.match(/^(\d{4}-\d{2}-\d{2})-([a-z]+)-(.+)\.md$/);
  if (!m) return null;
  const [_, dateStr, category, slug] = m;
  if (!CATEGORIES.includes(category)) return null;
  return { date: new Date(dateStr), category, slug, filename };
}

function extractTitleFromMarkdown(content) {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    return titleMatch[1].trim().replace(/\s+/g, ' ');
  }
  const titleMatch2 = content.match(/^##\s+(.+)$/m);
  if (titleMatch2) {
    return titleMatch2[1].trim().replace(/\s+/g, ' ');
  }
  return null;
}

// Génération des pages HTML
function createArticlePage(article) {
  let contentHtml = article.html.replace(/<h[12][^>]*>.*?<\/h[12]>/s, '');
  
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
      <div class="article-dates">
        <time class="article-date">Publié le ${article.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</time>
        ${article.modifiedDate ? `<time class="article-modified">Modifié le ${article.modifiedDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</time>` : ''}
      </div>
    </header>
    <div class="article-content">
      ${contentHtml}
    </div>
  </article>
</main>
<footer>
  <div class="footer-content">
    <nav class="footer-nav">
      <a href="index.html" class="footer-link">Accueil</a>
      <a href="${article.category}.html" class="footer-link">${article.category.charAt(0).toUpperCase() + article.category.slice(1)}</a>
      <a href="contact.html" class="footer-link">Contact</a>
      <a href="a-propos.html" class="footer-link">À propos</a>
    </nav>
    <p class="footer-text">&copy; 2024 Blog Minimaliste. Tous droits réservés.</p>
  </div>
</footer>
</body>
</html>`;

  const filename = `${article.date.toISOString().split('T')[0]}-${article.category}-${article.slug}.html`;
  fs.writeFileSync(filename, template, 'utf-8');
  return filename;
}

function getArticles() {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  
  const metadata = loadMetadata();
  const files = fs.readdirSync(ARTICLES_DIR);
  const articles = [];
  let hasChanges = false;
  
  for (const fname of files) {
    if (fname.endsWith('.md')) {
      const meta = parseFilename(fname);
      if (meta) {
        const filepath = path.join(ARTICLES_DIR, fname);
        const content = fs.readFileSync(filepath, 'utf-8');
        const html = marked.parse(content);
        const title = extractTitleFromMarkdown(content) || meta.slug.replace(/-/g, ' ');
        
        const currentHash = getFileHash(filepath);
        const previousHash = metadata[fname]?.hash;
        const previousTitle = metadata[fname]?.title;
        const isModified = currentHash !== previousHash || title !== previousTitle;
        
        if (isModified) {
          hasChanges = true;
          console.log(`📝 Article modifié: ${fname}`);
          if (title !== previousTitle) {
            console.log(`   Titre: "${previousTitle}" → "${title}"`);
          }
        }
        
        const modifiedDate = (isModified && previousHash) ? new Date() : metadata[fname]?.modifiedDate;
        
        articles.push({ 
          ...meta, 
          html, 
          title,
          modifiedDate: modifiedDate ? new Date(modifiedDate) : null
        });
        
        metadata[fname] = {
          hash: currentHash,
          title: title,
          category: meta.category,
          modifiedDate: modifiedDate ? new Date(modifiedDate) : null
        };
      }
    }
  }
  
  saveMetadata(metadata);
  articles.sort((a, b) => b.date - a.date);
  
  if (hasChanges) {
    console.log('🔄 Régénération des pages HTML...');
  }
  
  return articles;
}

function generateIndexHTML(articles) {
  const articlesHtml = articles.map(art => {
    const articlePage = createArticlePage(art);
    const excerpt = art.html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().substring(0, 150);
    return `<article class="article-card" data-category="${art.category}">
  <div class="article-content">
    <h3 class="article-title"><a href="${articlePage}" style="text-decoration: none; color: inherit;">${art.title}</a></h3>
    <p class="article-excerpt">${excerpt}${excerpt.length >= 150 ? '...' : ''}</p>
    <div class="article-date">${art.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
  </div>
</article>`;
  }).join('\n\n');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Blog Nemoscit</title>
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
  <section class="articles-list">
    <div class="articles-grid">
${articlesHtml}
    </div>
  </section>
</main>
<footer>
  <div class="footer-content">
    <nav class="footer-nav">
      <a href="contact.html" class="footer-link">Contact</a>
      <a href="a-propos.html" class="footer-link">À propos</a>
    </nav>
    <p class="footer-text">&copy; 2024 Blog Minimaliste. Tous droits réservés.</p>
  </div>
</footer>
</body>
</html>`;

  fs.writeFileSync(INDEX_HTML, html, 'utf-8');
  console.log(`Page d'accueil générée avec ${articles.length} articles`);
}

function generateCategoryHTML(articles, category) {
  const categoryArticles = articles.filter(art => art.category === category);
  const articlesHtml = categoryArticles.map(art => {
    const articlePage = createArticlePage(art);
    const excerpt = art.html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().substring(0, 150);
    return `<article class="article-card" data-category="${art.category}">
  <div class="article-content">
    <h3 class="article-title"><a href="${articlePage}" style="text-decoration: none; color: inherit;">${art.title}</a></h3>
    <p class="article-excerpt">${excerpt}${excerpt.length >= 150 ? '...' : ''}</p>
    <div class="article-date">${art.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
  </div>
</article>`;
  }).join('\n\n');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${category.charAt(0).toUpperCase() + category.slice(1)} - Blog Nemoscit</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap" rel="stylesheet">
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
  <section class="articles-list">
    <div class="articles-grid">
${articlesHtml}
    </div>
  </section>
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

  fs.writeFileSync(`${category}.html`, html, 'utf-8');
  console.log(`Page ${category}.html générée avec ${categoryArticles.length} articles`);
}

// Fonctions principales
function buildSite() {
  console.log('🚀 Génération du site...');
  const articles = getArticles();
  generateIndexHTML(articles);

  for (const category of CATEGORIES) {
    generateCategoryHTML(articles, category);
  }
  
  console.log('✅ Site généré avec succès !');
}

function startWatchMode() {
  console.log('👀 Mode watch activé - Surveillance des fichiers Markdown...');
  console.log('Appuyez sur Ctrl+C pour arrêter');
  
  fs.watch(ARTICLES_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.md')) {
      console.log(`\n📁 Changement détecté: ${filename}`);
      buildSite();
    }
  });
}

// Exécution
if (isWatchMode) {
  buildSite();
  startWatchMode();
} else {
  buildSite();
} 