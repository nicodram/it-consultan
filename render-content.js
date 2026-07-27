// Hydrates index.html sections from Supabase `page_sections`.
// If the fetch fails (offline, RLS misconfigured, etc.) the static HTML
// already in index.html is left untouched, so the page never renders empty.

const ICONS = {
  clock: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  briefcase: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  layers: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
};

function rcEscape(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function animateHeroCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 2000;
  const startTime = performance.now();
  const update = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * easeOut) + '+';
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function renderHero(data) {
  if (!data) return;
  const badge = document.getElementById('hero-badge-text');
  if (badge && data.badge_text) badge.textContent = data.badge_text;

  const title = document.getElementById('hero-title');
  if (title && data.title_line1 && data.title_highlight) {
    title.innerHTML = `${rcEscape(data.title_line1)}<br>Meets <span class="text-gradient">${rcEscape(data.title_highlight)}</span>`;
  }

  const tagline = document.getElementById('hero-tagline');
  if (tagline && data.tagline) tagline.textContent = data.tagline;

  const statsWrap = document.getElementById('hero-stats');
  if (statsWrap && Array.isArray(data.stats) && data.stats.length) {
    statsWrap.innerHTML = data.stats.map((s, i) => `
      ${i > 0 ? '<div class="stat-divider"></div>' : ''}
      <div class="stat-item">
        <span class="stat-number text-gradient" data-target="${Number(s.target) || 0}">${Number(s.target) || 0}</span>
        <span class="stat-label">${rcEscape(s.label)}</span>
      </div>
    `).join('');
    statsWrap.querySelectorAll('.stat-number').forEach(animateHeroCounter);
  }
}

function renderAbout(data) {
  if (!data) return;
  const cardsWrap = document.getElementById('about-cards');
  if (cardsWrap && Array.isArray(data.cards) && data.cards.length) {
    cardsWrap.innerHTML = data.cards.map(c => `
      <div class="summary-card glass-panel">
        <div class="card-icon-wrapper">${ICONS[c.icon] || ICONS.layers}</div>
        <h3>${rcEscape(c.title)}</h3>
        <p>${rcEscape(c.text)}</p>
      </div>
    `).join('');
  }
  const summaryEl = document.getElementById('about-summary-text');
  if (summaryEl && data.summary_text) summaryEl.textContent = data.summary_text;
}

function renderSkills(data) {
  const grid = document.getElementById('skills-grid');
  if (!grid || !Array.isArray(data) || !data.length) return;
  grid.innerHTML = data.map(s => `
    <div class="skill-card glass-panel">
      <div class="skill-header">
        <span class="skill-icon">${s.icon || ''}</span>
        <span class="skill-label">${rcEscape(s.label)}</span>
      </div>
      <div class="skill-content">
        <ul>${(s.items || []).map(i => `<li>${rcEscape(i)}</li>`).join('')}</ul>
      </div>
    </div>
  `).join('');
}

function renderTechTags(data) {
  const wrap = document.getElementById('tech-tags');
  if (!wrap || !Array.isArray(data) || !data.length) return;

  const tagHtml = (tag, hidden) => {
    // Supports both the new {name, logo_url} shape and the older plain-string shape.
    const name = typeof tag === 'string' ? tag : tag.name;
    const logoUrl = typeof tag === 'string' ? null : tag.logo_url;
    const logo = logoUrl
      ? `<img class="tech-tag-logo" src="${rcEscape(logoUrl)}" alt="" loading="lazy" onerror="this.remove()">`
      : '';
    return `<span class="tech-tag"${hidden ? ' aria-hidden="true"' : ''}>${logo}${rcEscape(name)}</span>`;
  };

  // Duplicate the track once so the CSS marquee animation (translateX -50%) loops seamlessly.
  wrap.innerHTML = data.map(t => tagHtml(t, false)).join('') + data.map(t => tagHtml(t, true)).join('');
}

function renderExperience(data) {
  const wrap = document.getElementById('experience-timeline');
  if (!wrap || !Array.isArray(data) || !data.length) return;
  wrap.innerHTML = data.map(e => `
    <div class="timeline-item">
      <div class="timeline-marker"></div>
      <div class="timeline-card glass-panel">
        <div class="timeline-header">
          <span class="timeline-date">${rcEscape(e.date_range)}</span>
          <span class="timeline-type">${rcEscape(e.type_label)}</span>
        </div>
        <h3 class="timeline-title">${rcEscape(e.title)}</h3>
        <span class="timeline-company">${rcEscape(e.company)}</span>
        <ul class="timeline-list">${(e.bullets || []).map(b => `<li>${rcEscape(b)}</li>`).join('')}</ul>
      </div>
    </div>
  `).join('');
}

function renderEducation(data) {
  if (!data) return;
  const map = { 'edu-degree': data.degree, 'edu-school': data.school, 'edu-year': data.year_range };
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el && val) el.textContent = val;
  });
  const gpaEl = document.getElementById('edu-gpa');
  if (gpaEl && data.gpa) gpaEl.textContent = 'GPA: ' + data.gpa;

  const docWrap = document.getElementById('edu-document');
  if (docWrap && data.document_url) {
    const url = data.document_url;
    const isPdf = /\.pdf($|\?)/i.test(url);
    docWrap.innerHTML = isPdf
      ? `<iframe src="${rcEscape(url)}" title="${rcEscape(data.document_title || 'Document')}"></iframe>`
      : `<img src="${rcEscape(url)}" alt="${rcEscape(data.document_title || 'Document')}">`;
  }
}

function renderCertifications(data) {
  const wrap = document.getElementById('cert-list');
  if (!wrap || !Array.isArray(data) || !data.length) return;
  wrap.innerHTML = data.map(c => `
    <div class="cert-item glass-panel">
      <span class="cert-year">${rcEscape(c.year)}</span>
      <div class="cert-info">
        <h4>${rcEscape(c.title)}</h4>
        <p>${rcEscape(c.subtitle)}</p>
      </div>
    </div>
  `).join('');
}

function renderOrganizations(data) {
  const wrap = document.getElementById('org-grid');
  if (!wrap || !Array.isArray(data) || !data.length) return;
  wrap.innerHTML = data.map(o => `
    <div class="org-item">
      <span class="org-dot"></span>
      <div>
        <strong>${rcEscape(o.name)}</strong>
        <span class="org-detail">${rcEscape(o.detail)}</span>
      </div>
    </div>
  `).join('');
}

function renderProjects(data) {
  const wrap = document.getElementById('projects-grid');
  if (!wrap || !Array.isArray(data) || !data.length) return;
  wrap.innerHTML = data.map((p, i) => {
    const accentIdx = new Set([i % 6, (i * 3 + 1) % 6]);
    const blocks = Array.from({ length: 6 }, (_, b) => `<div class="grid-block${accentIdx.has(b) ? ' accent' : ''}"></div>`).join('');
    return `
      <article class="showcase-card glass-panel">
        <div class="showcase-badge">${rcEscape(p.badge)}</div>
        <div class="showcase-visual"><div class="visual-grid">${blocks}</div></div>
        <div class="showcase-content">
          <h3>${rcEscape(p.title)}</h3>
          <p>${rcEscape(p.description)}</p>
          <div class="showcase-tags">${(p.tags || []).map(t => `<span class="tag">${rcEscape(t)}</span>`).join('')}</div>
        </div>
      </article>
    `;
  }).join('');
}

function renderContact(data) {
  if (!data) return;
  const subtitle = document.getElementById('contact-subtitle');
  if (subtitle && data.subtitle_text) subtitle.textContent = data.subtitle_text;

  const linksWrap = document.getElementById('contact-links');
  if (linksWrap && data.email && data.phone && data.linkedin_url && data.location) {
    linksWrap.innerHTML = `
      <a href="mailto:${rcEscape(data.email)}" class="contact-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        <span>${rcEscape(data.email)}</span>
      </a>
      <a href="tel:${rcEscape(data.phone_href || data.phone)}" class="contact-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.8.4 1.57.7 2.28a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.71.3 1.48.57 2.28.7A2 2 0 0 1 22 16.92z"/></svg>
        <span>${rcEscape(data.phone)}</span>
      </a>
      <a href="${rcEscape(data.linkedin_url)}" target="_blank" class="contact-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
        <span>LinkedIn Profile</span>
      </a>
      <div class="contact-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>${rcEscape(data.location)}</span>
      </div>
    `;
  }

  const emailLink = document.getElementById('footer-email-link');
  if (emailLink && data.email) emailLink.href = 'mailto:' + data.email;
  const linkedinLink = document.getElementById('footer-linkedin-link');
  if (linkedinLink && data.linkedin_url) linkedinLink.href = data.linkedin_url;
}

const RENDERERS = {
  hero: renderHero,
  about: renderAbout,
  skills: renderSkills,
  tech_tags: renderTechTags,
  experience: renderExperience,
  education: renderEducation,
  certifications: renderCertifications,
  organizations: renderOrganizations,
  projects: renderProjects,
  contact: renderContact,
};

async function hydratePageFromCms() {
  try {
    const { data, error } = await db.from('page_sections').select('section, data');
    if (error || !data) return;
    data.forEach(row => {
      const renderer = RENDERERS[row.section];
      if (renderer) renderer(row.data);
    });
  } catch (err) {
    console.warn('CMS content unavailable, showing static fallback content.', err);
  }
}

hydratePageFromCms();
