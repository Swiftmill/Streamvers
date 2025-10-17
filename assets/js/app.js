import { library, pagesContent, searchIndex } from './data.js';

const itemMap = new Map();
Object.values(library).forEach(group => {
  group.forEach(item => {
    itemMap.set(item.id, item);
  });
});

const navMap = {
  home: 'index.html',
  films: 'films.html',
  series: 'series.html',
  anime: 'anime.html',
  directs: 'directs.html'
};

const pageKey = document.body.dataset.page || 'home';
const pageConfig = pagesContent[pageKey] ?? pagesContent.home;

document.querySelectorAll('.nav-link').forEach(link => {
  if (link.getAttribute('href') === navMap[pageKey]) {
    link.classList.add('is-active');
  }
});

const detailUrl = id => `detail.html?id=${encodeURIComponent(id)}`;

const heroElements = {
  badge: document.getElementById('heroBadge'),
  title: document.getElementById('heroTitle'),
  subtitle: document.getElementById('heroSubtitle'),
  description: document.getElementById('heroDescription'),
  background: document.getElementById('heroBackground'),
  meta: document.getElementById('heroMeta'),
  cta: document.getElementById('heroCta'),
  trailer: document.getElementById('heroTrailer')
};

const heroConfig = pageConfig.hero;
if (heroConfig) {
  const heroItem = heroConfig.itemId ? itemMap.get(heroConfig.itemId) : undefined;
  if (heroElements.badge) heroElements.badge.textContent = heroConfig.badge ?? '';
  if (heroElements.title) heroElements.title.textContent = heroConfig.title ?? '';
  if (heroElements.subtitle) heroElements.subtitle.textContent = heroConfig.subtitle ?? '';
  if (heroElements.description) heroElements.description.textContent = heroConfig.description ?? '';
  if (heroElements.background)
    heroElements.background.style.backgroundImage = `url(${heroConfig.background})`;
  if (heroElements.meta) {
    if (heroItem) {
      const rating = heroItem.rating ? heroItem.rating.toFixed(1) : '–';
      const tags = heroItem.tags ? heroItem.tags.slice(0, 2).join(' • ') : '';
      heroElements.meta.innerHTML = [
        `⭐ ${rating}`,
        heroItem.year,
        heroItem.duration,
        tags
      ]
        .filter(Boolean)
        .map(value => `<span>${value}</span>`)
        .join('');
    } else {
      heroElements.meta.textContent = '';
    }
  }
  if (heroElements.cta) {
    heroElements.cta.textContent = heroConfig.cta ?? '';
    if (heroItem) {
      heroElements.cta.href = detailUrl(heroItem.id);
      heroElements.cta.removeAttribute('target');
      heroElements.cta.removeAttribute('rel');
    } else {
      heroElements.cta.href = heroConfig.ctaLink ?? '#';
      if (heroConfig.ctaExternal) {
        heroElements.cta.target = '_blank';
        heroElements.cta.rel = 'noopener';
      } else {
        heroElements.cta.removeAttribute('target');
        heroElements.cta.removeAttribute('rel');
      }
    heroElements.cta.href = heroItem?.trailer ?? '#';
    if (heroItem?.trailer) {
      heroElements.cta.target = '_blank';
      heroElements.cta.rel = 'noopener';
    }
  }
  if (heroElements.trailer) {
    heroElements.trailer.textContent = heroConfig.trailerLabel ?? '';
    if (heroItem?.trailer) {
      heroElements.trailer.addEventListener('click', () => {
        window.open(heroItem.trailer, '_blank');
      });
    }
  }
}

function createMediaCard(item) {
  const link = document.createElement('a');
  link.className = 'media-card';
  link.href = detailUrl(item.id);
  link.innerHTML = `
  const card = document.createElement('article');
  card.className = 'media-card';
  card.innerHTML = `
    <div class="media-card__poster">
      <img src="${item.poster}" alt="${item.title}" loading="lazy" />
    </div>
    <div class="media-card__body">
      <h3 class="media-card__title">${item.title}</h3>
      <div class="media-card__meta">
        <span>⭐ ${item.rating ? item.rating.toFixed(1) : '–'}</span>
        <span>${item.year ?? ''}</span>
      </div>
      <div class="media-card__tags">
        ${(item.tags || [])
          .slice(0, 3)
          .map(tag => `<span>${tag}</span>`)
          .join('')}
      </div>
    </div>
  `;
  return link;
  return card;
}

function createTopEntry(item) {
  const li = document.createElement('li');
  const link = document.createElement('a');
  link.className = 'top-grid__link';
  link.href = detailUrl(item.id);
  link.innerHTML = `
    <img src="${item.backdrop || item.poster}" alt="${item.title}" loading="lazy" />
    <div class="top-grid__body">
      <h3 class="top-grid__title">${item.title}</h3>
      <div class="top-grid__meta">
        <span>⭐ ${item.rating ? item.rating.toFixed(1) : '–'}</span>
        <span>${item.year ?? ''}</span>
      </div>
    </div>
  `;
  li.appendChild(link);
  const img = document.createElement('img');
  img.src = item.backdrop || item.poster;
  img.alt = item.title;
  img.loading = 'lazy';
  li.appendChild(img);
  const body = document.createElement('div');
  body.className = 'top-grid__body';
  body.innerHTML = `
    <h3 class="top-grid__title">${item.title}</h3>
    <div class="top-grid__meta">
      <span>⭐ ${item.rating ? item.rating.toFixed(1) : '–'}</span>
      <span>${item.year ?? ''}</span>
    </div>
  `;
  li.appendChild(body);
  return li;
}

const contentContainer = document.getElementById('contentSections');
if (contentContainer && Array.isArray(pageConfig.sections)) {
  pageConfig.sections.forEach(section => {
    const sectionEl = document.createElement('section');
    sectionEl.className = 'content-section';
    if (section.highlight) sectionEl.classList.add('section-highlight');

    const header = document.createElement('div');
    header.className = 'section-header';
    const title = document.createElement('h2');
    title.textContent = section.title;
    header.appendChild(title);
    sectionEl.appendChild(header);

    const row = document.createElement('div');
    row.className = 'media-row';
    (section.items || []).forEach(id => {
      const item = itemMap.get(id);
      if (!item) return;
      row.appendChild(createMediaCard(item));
    });

    sectionEl.appendChild(row);
    contentContainer.appendChild(sectionEl);
  });
}

const topSection = document.getElementById('topSection');
const topTitle = document.getElementById('topTitle');
const topGrid = document.getElementById('topGrid');
if (pageConfig.topTen?.items?.length && topSection && topTitle && topGrid) {
  topSection.hidden = false;
  topTitle.textContent = pageConfig.topTen.title;
  topGrid.innerHTML = '';
  pageConfig.topTen.items
    .map(id => itemMap.get(id))
    .filter(Boolean)
    .forEach(item => {
      topGrid.appendChild(createTopEntry(item));
    });
}

const searchForm = document.getElementById('globalSearch');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchGrid = document.getElementById('searchGrid');
const searchTitle = document.querySelector('.search-results__title');
const filterChips = document.getElementById('filterChips');
let activeFilter = null;

if (filterChips && Array.isArray(pageConfig.filters)) {
  filterChips.innerHTML = '';
  pageConfig.filters.forEach(filter => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = filter;
    chip.addEventListener('click', () => {
      activeFilter = activeFilter === filter ? null : filter;
      Array.from(filterChips.children).forEach(child => {
        child.classList.toggle('is-active', child.textContent === activeFilter);
      });
      updateSearchResults(searchInput?.value ?? '');
    });
    filterChips.appendChild(chip);
  });
}

if (searchForm) {
  searchForm.addEventListener('submit', event => {
    event.preventDefault();
    updateSearchResults(searchInput?.value ?? '');
  });
}

if (searchInput) {
  searchInput.addEventListener('input', event => {
    updateSearchResults(event.target.value);
  });
  searchInput.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      searchInput.blur();
      hideSearchResults();
    }
  });
}

function hideSearchResults() {
  if (searchResults) {
    searchResults.hidden = true;
    if (searchGrid) searchGrid.innerHTML = '';
  }
}

function updateSearchResults(value) {
  const query = value.trim().toLowerCase();
  const hasFilter = Boolean(activeFilter);
  if (query.length < 2 && !hasFilter) {
    hideSearchResults();
    return;
  }

  let matches = searchIndex.filter(item => {
    const matchesFilter = !hasFilter
      ? true
      : item.tags.some(tag => tag.toLowerCase().includes(activeFilter.toLowerCase())) ||
        item.category.toLowerCase().includes(activeFilter.toLowerCase());
    if (!matchesFilter) return false;
    if (!query) return true;
    const inTitle = item.title.toLowerCase().includes(query);
    const inTags = item.tags.some(tag => tag.toLowerCase().includes(query));
    return inTitle || inTags;
  });

  matches = matches.slice(0, 12);

  if (!searchResults || !searchGrid || !searchTitle) return;

  searchResults.hidden = false;
  searchGrid.innerHTML = '';
  searchTitle.textContent = `Résultats (${matches.length})`;

  if (matches.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Aucun résultat ne correspond à votre recherche pour le moment.';
    searchGrid.appendChild(empty);
    return;
  }

  matches.forEach(item => {
    searchGrid.appendChild(createMediaCard(item));
  });
}

const openSearchButton = document.getElementById('openSearch');
if (openSearchButton && searchInput) {
  openSearchButton.addEventListener('click', () => {
    searchInput.focus({ preventScroll: true });
    document.getElementById('searchPanel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

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
