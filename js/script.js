let entries = [];

// ── Card rendering ──

function renderCards(data) {
  const grid = document.getElementById('grid');
  grid.innerHTML = data.map((e, index) => {
    const tags = e.tags.map(t => t.toLowerCase()).join(' ');
    const dayLabel = e.dayLabel || `Day ${e.day}`;

    const coverHTML = e.coverImage
      ? `<img src="${e.coverImage}" alt="${dayLabel} - ${e.title}" />`
      : `<div class="photo-placeholder">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:28px;height:28px;color:var(--accent)"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M9 5l1-2h4l1 2"/></svg>
           <span>Photos coming soon</span>
         </div>`;

    const stripHTML = e.photos && e.photos.length > 0
      ? e.photos.map((photo, i) =>
          `<div class="strip-slot" onclick="openLightbox(${index}, ${i}, event)">
             <img src="${photo}" alt="${dayLabel} photo ${i + 1}" />
           </div>`
        ).join('')
      : '';

    const tagsHTML = e.tags.map(t => `<span class="tag">${t}</span>`).join('');

    return `
      <article class="day-card" data-tags="${tags}" onclick="openModal(${index})">
        <div class="card-photo">${coverHTML}</div>
        <div class="card-body">
          <div class="card-header"><span class="day-num">${dayLabel}</span></div>
          <p class="card-title">${e.title}</p>
          <p class="card-location"><span class="loc-dot"></span>${e.location}</p>
          <p class="card-excerpt">${e.excerpt}</p>
          <div class="card-tags">${tagsHTML}</div>
          ${stripHTML ? `<div class="card-photo-strip">${stripHTML}</div>` : ''}
        </div>
      </article>`;
  }).join('');
}

// ── Modal ──

function openModal(index) {
  const e = entries[index];
  const dayLabel = e.dayLabel || `Day ${e.day}`;

  document.getElementById('modal-eyebrow').innerHTML = `<span class="day-num">${dayLabel}</span>&nbsp; Study abroad journal`;
  document.getElementById('modal-title').textContent = e.title;
  document.getElementById('modal-location').innerHTML = `<span class="loc-dot"></span> ${e.location}`;
  document.getElementById('modal-body').innerHTML = e.body;
  document.getElementById('modal-tags').innerHTML = e.tags.map(t => `<span class="tag">${t}</span>`).join('');

  const photoEl = document.getElementById('modal-photo');
  if (e.coverImage) {
    photoEl.innerHTML = `<img src="${e.coverImage}" alt="${dayLabel} - ${e.title}" />`;
  } else {
    photoEl.innerHTML = `<div class="photo-placeholder">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:32px;height:32px;color:var(--accent)"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M9 5l1-2h4l1 2"/></svg>
      <span style="font-size:12px;color:var(--accent)">Add your photo here</span>
    </div>`;
  }

  const galleryEl = document.getElementById('modal-gallery');
  if (e.photos && e.photos.length > 0) {
    galleryEl.innerHTML = `<p class="gallery-label">Photos</p>
      <div class="gallery-strip">
        ${e.photos.map((photo, i) =>
          `<div class="gallery-thumb" onclick="openLightbox(${index}, ${i})">
             <img src="${photo}" alt="${dayLabel} photo ${i + 1}" />
           </div>`
        ).join('')}
      </div>`;
    galleryEl.style.display = 'block';
  } else {
    galleryEl.innerHTML = '';
    galleryEl.style.display = 'none';
  }

  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}

// ── Lightbox ──

let lightboxPhotos = [];
let lightboxIndex = 0;

function openLightbox(entryIndex, photoIndex, event) {
  if (event) event.stopPropagation();
  const photos = entries[entryIndex].photos;
  if (!photos || photos.length === 0) return;
  lightboxPhotos = photos;
  lightboxIndex = photoIndex;
  const img = document.getElementById('lightbox-img');
  img.src = photos[photoIndex];
  img.alt = 'Photo ' + (photoIndex + 1);
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  prevBtn.style.display = photos.length > 1 ? 'flex' : 'none';
  nextBtn.style.display = photos.length > 1 ? 'flex' : 'none';
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox(event) {
  if (event) event.stopPropagation();
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightbox-img').src = '';
  if (!document.getElementById('modal').classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

function handleLightboxClick(e) {
  if (e.target === document.getElementById('lightbox')) closeLightbox();
}

function lightboxPrev(event) {
  if (event) event.stopPropagation();
  lightboxIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length;
  const img = document.getElementById('lightbox-img');
  img.src = lightboxPhotos[lightboxIndex];
  img.alt = 'Photo ' + (lightboxIndex + 1);
}

function lightboxNext(event) {
  if (event) event.stopPropagation();
  lightboxIndex = (lightboxIndex + 1) % lightboxPhotos.length;
  const img = document.getElementById('lightbox-img');
  img.src = lightboxPhotos[lightboxIndex];
  img.alt = 'Photo ' + (lightboxIndex + 1);
}

// ── Keyboard navigation ──

document.addEventListener('keydown', e => {
  if (document.getElementById('lightbox').classList.contains('open')) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev();
    if (e.key === 'ArrowRight') lightboxNext();
    return;
  }
  if (e.key === 'Escape') closeModal();
});

// ── Filter buttons ──

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.day-card').forEach(card => {
      if (filter === 'all' || card.dataset.tags.includes(filter)) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ── Bootstrap ──

document.addEventListener('DOMContentLoaded', () => {
  fetch('data/entries.json')
    .then(res => res.json())
    .then(data => {
      entries = data;
      renderCards(entries);
    })
    .catch(err => console.error('Failed to load entries:', err));
});
