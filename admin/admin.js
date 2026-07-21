// Admin dashboard: auth guard, articles CRUD, and a schema-driven generic
// form renderer for `page_sections` (avoids hand-writing one form per section).

// ---------------------------------------------------------------
// AUTH GUARD
// ---------------------------------------------------------------
(async function guard() {
  const { data } = await db.auth.getSession();
  if (!data.session) {
    window.location.replace('login.html');
    return;
  }
  document.getElementById('admin-whoami').textContent = data.session.user.email;
  init();
})();

db.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') window.location.replace('login.html');
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await db.auth.signOut();
  window.location.replace('login.html');
});

function init() {
  initTabs();
  initArticles();
  initPageSections();
}

// ---------------------------------------------------------------
// TABS
// ---------------------------------------------------------------
function initTabs() {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-panel').forEach(p => { p.hidden = true; p.classList.remove('active'); });
      btn.classList.add('active');
      const panel = document.getElementById('tab-' + btn.dataset.tab);
      panel.hidden = false;
      panel.classList.add('active');
    });
  });
}

// ---------------------------------------------------------------
// ARTICLES CRUD
// ---------------------------------------------------------------
function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function initArticles() {
  const form = document.getElementById('article-form');
  const newBtn = document.getElementById('new-article-btn');
  const cancelBtn = document.getElementById('article-cancel-btn');
  const titleInput = document.getElementById('article-title');
  const slugInput = document.getElementById('article-slug');
  const msgEl = document.getElementById('article-form-msg');
  let slugTouched = false;

  slugInput.addEventListener('input', () => { slugTouched = true; });
  titleInput.addEventListener('input', () => {
    if (!slugTouched) slugInput.value = slugify(titleInput.value);
  });

  function resetForm() {
    form.reset();
    document.getElementById('article-id').value = '';
    slugTouched = false;
    msgEl.hidden = true;
  }

  newBtn.addEventListener('click', () => {
    resetForm();
    form.hidden = false;
  });

  cancelBtn.addEventListener('click', () => {
    form.hidden = true;
    resetForm();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgEl.hidden = true;

    const id = document.getElementById('article-id').value;
    const payload = {
      title: titleInput.value.trim(),
      slug: slugify(slugInput.value.trim()),
      excerpt: document.getElementById('article-excerpt').value.trim(),
      cover_image_url: document.getElementById('article-cover').value.trim() || null,
      content: document.getElementById('article-content').value,
      published: document.getElementById('article-published').checked,
    };

    const { error } = id
      ? await db.from('articles').update(payload).eq('id', id)
      : await db.from('articles').insert(payload);

    if (error) {
      msgEl.textContent = 'Gagal menyimpan: ' + error.message;
      msgEl.hidden = false;
      return;
    }

    form.hidden = true;
    resetForm();
    loadArticlesTable();
  });

  window._editArticle = async (id) => {
    const { data, error } = await db.from('articles').select('*').eq('id', id).single();
    if (error || !data) return;
    document.getElementById('article-id').value = data.id;
    titleInput.value = data.title;
    slugInput.value = data.slug;
    slugTouched = true;
    document.getElementById('article-excerpt').value = data.excerpt || '';
    document.getElementById('article-cover').value = data.cover_image_url || '';
    document.getElementById('article-content').value = data.content;
    document.getElementById('article-published').checked = data.published;
    form.hidden = false;
    form.scrollIntoView({ behavior: 'smooth' });
  };

  window._deleteArticle = async (id) => {
    if (!confirm('Hapus artikel ini? Tindakan tidak bisa dibatalkan.')) return;
    const { error } = await db.from('articles').delete().eq('id', id);
    if (error) { alert('Gagal menghapus: ' + error.message); return; }
    loadArticlesTable();
  };

  loadArticlesTable();
}

async function loadArticlesTable() {
  const tbody = document.getElementById('articles-table-body');
  const { data, error } = await db.from('articles').select('*').order('updated_at', { ascending: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="5">Gagal memuat: ${escapeHtml(error.message)}</td></tr>`;
    return;
  }
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">Belum ada artikel.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(a => `
    <tr>
      <td>${escapeHtml(a.title)}</td>
      <td>${escapeHtml(a.slug)}</td>
      <td>${a.published ? 'Published' : 'Draft'}</td>
      <td>${new Date(a.updated_at).toLocaleDateString('id-ID')}</td>
      <td class="admin-table-actions">
        <button type="button" onclick="_editArticle('${a.id}')">Edit</button>
        <button type="button" onclick="_deleteArticle('${a.id}')">Hapus</button>
      </td>
    </tr>
  `).join('');
}

// ---------------------------------------------------------------
// GENERIC PAGE-SECTIONS FORM RENDERER
// ---------------------------------------------------------------
const SECTION_SCHEMAS = {
  hero: { label: 'Hero', kind: 'object', fields: [
    { key: 'badge_text', label: 'Badge Text', type: 'text' },
    { key: 'title_line1', label: 'Judul Baris 1', type: 'text' },
    { key: 'title_highlight', label: 'Judul Highlight (gradient)', type: 'text' },
    { key: 'tagline', label: 'Tagline', type: 'textarea' },
    { key: 'stats', label: 'Stats', type: 'list-objects', itemFields: [
      { key: 'target', label: 'Angka', type: 'number' },
      { key: 'label', label: 'Label', type: 'text' },
    ]},
  ]},
  about: { label: 'About / Summary', kind: 'object', fields: [
    { key: 'cards', label: 'Summary Cards', type: 'list-objects', itemFields: [
      { key: 'icon', label: 'Icon', type: 'select', options: ['clock', 'briefcase', 'layers'] },
      { key: 'title', label: 'Judul', type: 'text' },
      { key: 'text', label: 'Deskripsi', type: 'textarea' },
    ]},
    { key: 'summary_text', label: 'Paragraf Ringkasan', type: 'textarea' },
  ]},
  skills: { label: 'Skills', kind: 'list', itemFields: [
    { key: 'icon', label: 'Emoji Icon', type: 'text' },
    { key: 'label', label: 'Label (mono)', type: 'text' },
    { key: 'items', label: 'Daftar Item', type: 'list-strings' },
  ]},
  tech_tags: { label: 'Tech Tags', kind: 'list', itemFields: [
    { key: 'name', label: 'Nama Tool', type: 'text' },
    { key: 'logo_url', label: 'URL Logo (opsional, kosongkan jika tidak ada)', type: 'text' },
  ]},
  experience: { label: 'Pengalaman', kind: 'list', itemFields: [
    { key: 'date_range', label: 'Rentang Tanggal', type: 'text' },
    { key: 'type_label', label: 'Label Tipe', type: 'text' },
    { key: 'title', label: 'Judul Posisi', type: 'text' },
    { key: 'company', label: 'Perusahaan', type: 'text' },
    { key: 'bullets', label: 'Poin-poin', type: 'list-strings' },
  ]},
  education: { label: 'Pendidikan', kind: 'object', fields: [
    { key: 'degree', label: 'Gelar', type: 'text' },
    { key: 'school', label: 'Sekolah', type: 'text' },
    { key: 'year_range', label: 'Tahun', type: 'text' },
    { key: 'gpa', label: 'GPA', type: 'text' },
  ]},
  certifications: { label: 'Sertifikasi', kind: 'list', itemFields: [
    { key: 'year', label: 'Tahun', type: 'text' },
    { key: 'title', label: 'Judul', type: 'text' },
    { key: 'subtitle', label: 'Subjudul', type: 'text' },
  ]},
  organizations: { label: 'Organisasi', kind: 'list', itemFields: [
    { key: 'name', label: 'Nama Organisasi', type: 'text' },
    { key: 'detail', label: 'Detail', type: 'text' },
  ]},
  projects: { label: 'Proyek', kind: 'list', itemFields: [
    { key: 'badge', label: 'Badge', type: 'text' },
    { key: 'title', label: 'Judul', type: 'text' },
    { key: 'description', label: 'Deskripsi', type: 'textarea' },
    { key: 'tags', label: 'Tags', type: 'list-strings' },
  ]},
  contact: { label: 'Kontak', kind: 'object', fields: [
    { key: 'subtitle_text', label: 'Subtitle', type: 'textarea' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'phone', label: 'Nomor Telepon (tampil)', type: 'text' },
    { key: 'phone_href', label: 'Nomor Telepon (link)', type: 'text' },
    { key: 'linkedin_url', label: 'LinkedIn URL', type: 'text' },
    { key: 'location', label: 'Lokasi', type: 'text' },
  ]},
};

function buildSimpleField(field, dataObj, markDirty) {
  const row = document.createElement('div');
  row.className = 'admin-field';
  const labelEl = document.createElement('label');
  labelEl.textContent = field.label;
  row.appendChild(labelEl);

  if (field.type === 'textarea') {
    const ta = document.createElement('textarea');
    ta.rows = 3;
    ta.value = dataObj[field.key] ?? '';
    ta.addEventListener('input', () => { dataObj[field.key] = ta.value; markDirty(); });
    row.appendChild(ta);
  } else if (field.type === 'select') {
    const sel = document.createElement('select');
    (field.options || []).forEach(opt => {
      const o = document.createElement('option');
      o.value = opt; o.textContent = opt;
      sel.appendChild(o);
    });
    sel.value = dataObj[field.key] ?? field.options[0];
    sel.addEventListener('change', () => { dataObj[field.key] = sel.value; markDirty(); });
    row.appendChild(sel);
  } else {
    const input = document.createElement('input');
    input.type = field.type === 'number' ? 'number' : 'text';
    input.value = dataObj[field.key] ?? '';
    input.addEventListener('input', () => {
      dataObj[field.key] = field.type === 'number' ? Number(input.value) : input.value;
      markDirty();
    });
    row.appendChild(input);
  }
  return row;
}

function buildListStrings(arr, markDirty) {
  const wrap = document.createElement('div');
  wrap.className = 'admin-list-strings';
  function render() {
    wrap.innerHTML = '';
    arr.forEach((val, i) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'admin-list-row';
      const input = document.createElement('input');
      input.type = 'text';
      input.value = val;
      input.addEventListener('input', () => { arr[i] = input.value; markDirty(); });
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'admin-remove-btn';
      removeBtn.textContent = '✕';
      removeBtn.addEventListener('click', () => { arr.splice(i, 1); markDirty(); render(); });
      rowDiv.appendChild(input);
      rowDiv.appendChild(removeBtn);
      wrap.appendChild(rowDiv);
    });
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'admin-add-btn';
    addBtn.textContent = '+ Tambah';
    addBtn.addEventListener('click', () => { arr.push(''); markDirty(); render(); });
    wrap.appendChild(addBtn);
  }
  render();
  return wrap;
}

function renderFieldsInto(container, fields, dataObj, markDirty) {
  fields.forEach(field => {
    if (field.type === 'list-strings') {
      if (!Array.isArray(dataObj[field.key])) dataObj[field.key] = [];
      const row = document.createElement('div');
      row.className = 'admin-field';
      const labelEl = document.createElement('label');
      labelEl.textContent = field.label;
      row.appendChild(labelEl);
      row.appendChild(buildListStrings(dataObj[field.key], markDirty));
      container.appendChild(row);
    } else if (field.type === 'list-objects') {
      if (!Array.isArray(dataObj[field.key])) dataObj[field.key] = [];
      const row = document.createElement('div');
      row.className = 'admin-field';
      const labelEl = document.createElement('label');
      labelEl.textContent = field.label;
      row.appendChild(labelEl);
      row.appendChild(buildListObjects(dataObj[field.key], field.itemFields, markDirty));
      container.appendChild(row);
    } else {
      container.appendChild(buildSimpleField(field, dataObj, markDirty));
    }
  });
}

function emptyItemFor(itemFields) {
  const obj = {};
  itemFields.forEach(f => {
    obj[f.key] = (f.type === 'list-strings' || f.type === 'list-objects') ? [] : '';
  });
  return obj;
}

function buildListObjects(arr, itemFields, markDirty) {
  const wrap = document.createElement('div');
  wrap.className = 'admin-list-objects';
  function render() {
    wrap.innerHTML = '';
    arr.forEach((obj, i) => {
      const card = document.createElement('div');
      card.className = 'admin-subitem-card';
      const header = document.createElement('div');
      header.className = 'admin-subitem-header';
      const title = document.createElement('span');
      title.textContent = `#${i + 1}`;
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'admin-remove-btn';
      removeBtn.textContent = 'Hapus';
      removeBtn.addEventListener('click', () => { arr.splice(i, 1); markDirty(); render(); });
      header.appendChild(title);
      header.appendChild(removeBtn);
      card.appendChild(header);
      renderFieldsInto(card, itemFields, obj, markDirty);
      wrap.appendChild(card);
    });
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'admin-add-btn';
    addBtn.textContent = '+ Tambah Item';
    addBtn.addEventListener('click', () => { arr.push(emptyItemFor(itemFields)); markDirty(); render(); });
    wrap.appendChild(addBtn);
  }
  render();
  return wrap;
}

async function initPageSections() {
  const accordion = document.getElementById('page-sections-accordion');
  accordion.innerHTML = '<p>Memuat konten…</p>';

  const { data, error } = await db.from('page_sections').select('section, data');
  if (error) {
    accordion.innerHTML = `<p class="admin-msg">Gagal memuat: ${escapeHtml(error.message)}</p>`;
    return;
  }

  const bySection = {};
  (data || []).forEach(row => { bySection[row.section] = row.data; });

  accordion.innerHTML = '';

  Object.entries(SECTION_SCHEMAS).forEach(([sectionKey, schema]) => {
    // Work on a local mutable copy so edits don't hit the DB until Save.
    let sectionData = bySection[sectionKey];
    if (sectionData === undefined) {
      sectionData = schema.kind === 'list' || schema.kind === 'list-strings-root' ? [] : {};
    }

    const panel = document.createElement('div');
    panel.className = 'admin-accordion-panel glass-panel';

    const headerBtn = document.createElement('button');
    headerBtn.type = 'button';
    headerBtn.className = 'admin-accordion-header';
    headerBtn.textContent = schema.label;

    const body = document.createElement('div');
    body.className = 'admin-accordion-body';
    body.hidden = true;

    headerBtn.addEventListener('click', () => { body.hidden = !body.hidden; });

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn-primary admin-section-save';
    saveBtn.textContent = 'Simpan ' + schema.label;

    const msg = document.createElement('p');
    msg.className = 'admin-msg';
    msg.hidden = true;

    function markDirty() { msg.hidden = true; }

    if (schema.kind === 'object') {
      renderFieldsInto(body, schema.fields, sectionData, markDirty);
    } else if (schema.kind === 'list') {
      body.appendChild(buildListObjects(sectionData, schema.itemFields, markDirty));
    } else if (schema.kind === 'list-strings-root') {
      body.appendChild(buildListStrings(sectionData, markDirty));
    }

    saveBtn.addEventListener('click', async () => {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Menyimpan…';
      const { error: saveError } = await db
        .from('page_sections')
        .upsert({ section: sectionKey, data: sectionData }, { onConflict: 'section' });
      saveBtn.disabled = false;
      saveBtn.textContent = 'Simpan ' + schema.label;
      msg.hidden = false;
      msg.textContent = saveError ? ('Gagal menyimpan: ' + saveError.message) : 'Tersimpan.';
      msg.className = 'admin-msg ' + (saveError ? 'admin-msg-error' : 'admin-msg-ok');
    });

    body.appendChild(saveBtn);
    body.appendChild(msg);
    panel.appendChild(headerBtn);
    panel.appendChild(body);
    accordion.appendChild(panel);
  });
}
