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

// Scripts JavaScript pour toutes les pages
const themeScript = `
<script>
// Script anti-flash : applique le thème immédiatement
(function() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
})();

// Gestion du thème
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Mise à jour des icônes
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  
  if (newTheme === 'dark') {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  } else {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  }
}

// Initialisation complète du thème
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const html = document.documentElement;
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  const body = document.body;
  
  // Appliquer le thème
  html.setAttribute('data-theme', savedTheme);
  
  // Mettre à jour les icônes
  if (savedTheme === 'dark') {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  } else {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  }
  
  // Afficher le contenu avec transition
  setTimeout(() => {
    body.classList.add('theme-loaded');
  }, 10);
});
</script>`;

// Script inline pour le head (anti-flash immédiat)
const headThemeScript = `
<script>
// Application immédiate du thème avant tout rendu
(function() {
  try {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
</script>`;

// Fonction pour créer le bouton de thème
function createThemeButton() {
  return `<!-- Bouton de basculement thème -->
<button class="theme-toggle" onclick="toggleTheme()" title="Basculer entre mode sombre et clair">
  <svg class="sun-icon" viewBox="0 0 24 24">
    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
  </svg>
  <svg class="moon-icon" viewBox="0 0 24 24" style="display: none;">
    <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"/>
  </svg>
</button>`;
}

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
  ${headThemeScript}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
${createThemeButton()}

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

${themeScript}
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
  ${headThemeScript}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
${createThemeButton()}

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

${themeScript}
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
  ${headThemeScript}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
${createThemeButton()}

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

${themeScript}
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