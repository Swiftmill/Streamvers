import { library } from './data.js';

const params = new URLSearchParams(window.location.search);
const itemId = params.get('id');

const itemMap = new Map();
Object.values(library).forEach(group => {
  group.forEach(item => {
    itemMap.set(item.id, item);
  });
});

const detailUrl = id => `detail.html?id=${encodeURIComponent(id)}`;

const categoryLinkMap = {
  Films: 'films.html',
  "Séries": 'series.html',
  "Animés": 'anime.html',
  "Directs": 'directs.html'
};

const heroSection = document.getElementById('detailHero');
const fallbackSection = document.getElementById('detailFallback');

const item = itemMap.get(itemId ?? '');

function highlightNavigation(targetHref) {
  if (!targetHref) return;
  document
    .querySelectorAll('.nav-link')
    .forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === targetHref));
}

function setBackLink(targetHref) {
  const backLink = document.getElementById('detailBack');
  if (!backLink) return;

  backLink.addEventListener('click', event => {
    event.preventDefault();
    if (document.referrer && document.referrer.includes(window.location.origin)) {
      window.history.back();
      return;
    }
    if (targetHref) {
      window.location.href = targetHref;
    } else {
      window.location.href = 'index.html';
    }
  });
}

function renderDetail(item) {
  if (!item) {
    if (heroSection) heroSection.hidden = true;
    if (fallbackSection) fallbackSection.hidden = false;
    document.title = 'XalaFlix • Contenu introuvable';
    return;
  }

  document.title = `XalaFlix • ${item.title}`;

  const targetHref = categoryLinkMap[item.category];
  highlightNavigation(targetHref);
  setBackLink(targetHref);

  const background = document.getElementById('detailBackground');
  if (background) background.style.backgroundImage = `url(${item.backdrop || item.poster})`;

  const poster = document.getElementById('detailPoster');
  if (poster) {
    poster.innerHTML = `
      <img src="${item.poster}" alt="${item.title}" loading="lazy" />
    `;
  }

  const badge = document.getElementById('detailBadge');
  if (badge) badge.textContent = item.category ?? '';

  const title = document.getElementById('detailTitle');
  if (title) title.textContent = item.title;

  const meta = document.getElementById('detailMeta');
  if (meta) {
    const rating = item.rating ? item.rating.toFixed(1) : '–';
    const parts = [
      `⭐ ${rating}`,
      item.year,
      item.duration
    ].filter(Boolean);
    meta.innerHTML = parts.map(value => `<span>${value}</span>`).join('');
  }

  const tags = document.getElementById('detailTags');
  if (tags) {
    tags.innerHTML = (item.tags || [])
      .map(tag => `<span>${tag}</span>`)
      .join('');
  }

  const synopsis = document.getElementById('detailSynopsis');
  if (synopsis) synopsis.textContent = item.synopsis ?? '';

  const watch = document.getElementById('detailWatch');
  if (watch) {
    if (item.trailer) {
      watch.href = item.trailer;
      watch.target = '_blank';
      watch.rel = 'noopener';
      watch.classList.remove('is-disabled');
      watch.removeAttribute('aria-disabled');
      watch.textContent = 'Regarder la bande-annonce';
    } else {
      watch.href = '#';
      watch.removeAttribute('target');
      watch.removeAttribute('rel');
      watch.classList.add('is-disabled');
      watch.setAttribute('aria-disabled', 'true');
      watch.textContent = 'Bande-annonce indisponible';
    }
  }

  const categoryLink = document.getElementById('detailCategory');
  const categoryLabel = document.getElementById('detailCategoryLabel');
  if (categoryLink && categoryLabel) {
    if (targetHref) {
      categoryLink.href = targetHref;
      categoryLabel.textContent = item.category;
    } else {
      categoryLink.href = 'index.html';
      categoryLabel.textContent = 'Accueil';
    }
  }

  const facts = document.getElementById('detailFacts');
  const detailContent = document.getElementById('detailContent');
  const detailEntries = [];
  if (item.year) detailEntries.push(['Année de sortie', item.year]);
  if (item.duration) detailEntries.push(['Durée', item.duration]);
  if (item.tags?.length) detailEntries.push(['Genres', item.tags.join(', ')]);
  if (item.rating) detailEntries.push(['Note moyenne', `${item.rating.toFixed(1)}/10`]);

  if (facts && detailContent && detailEntries.length) {
    facts.innerHTML = detailEntries
      .map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`)
      .join('');
    detailContent.hidden = false;
  }

  const relatedSection = document.getElementById('relatedSection');
  const relatedGrid = document.getElementById('relatedGrid');
  if (relatedSection && relatedGrid) {
    const libraryKey = Object.keys(library).find(key => library[key].some(entry => entry.id === item.id));
    const source = libraryKey ? library[libraryKey] : [];
    const relatedItems = source.filter(entry => entry.id !== item.id).slice(0, 6);

    if (relatedItems.length) {
      relatedGrid.innerHTML = '';
      relatedItems.forEach(entry => {
        relatedGrid.appendChild(createMediaCard(entry));
      });
      relatedSection.hidden = false;
    }
  }
}

function createMediaCard(entry) {
  const link = document.createElement('a');
  link.className = 'media-card';
  link.href = detailUrl(entry.id);
  link.innerHTML = `
    <div class="media-card__poster">
      <img src="${entry.poster}" alt="${entry.title}" loading="lazy" />
    </div>
    <div class="media-card__body">
      <h3 class="media-card__title">${entry.title}</h3>
      <div class="media-card__meta">
        <span>⭐ ${entry.rating ? entry.rating.toFixed(1) : '–'}</span>
        <span>${entry.year ?? ''}</span>
      </div>
      <div class="media-card__tags">
        ${(entry.tags || [])
          .slice(0, 3)
          .map(tag => `<span>${tag}</span>`)
          .join('')}
      </div>
    </div>
  `;
  return link;
}

renderDetail(item);

const toggleButton = document.querySelector('.navbar__toggle');
const menu = document.getElementById('navbarMenu');
if (toggleButton && menu) {
  toggleButton.addEventListener('click', () => {
    const expanded = toggleButton.getAttribute('aria-expanded') === 'true';
    toggleButton.setAttribute('aria-expanded', (!expanded).toString());
    menu.classList.toggle('is-open', !expanded);
  });
  Array.from(menu.querySelectorAll('a')).forEach(link =>
    link.addEventListener('click', () => {
      toggleButton.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    })
  );
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 960 && menu) {
    menu.classList.remove('is-open');
    toggleButton?.setAttribute('aria-expanded', 'false');
  }
});
