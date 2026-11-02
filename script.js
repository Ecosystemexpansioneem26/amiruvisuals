const grid = document.getElementById('grid');
const modal = document.getElementById('modal');
const player = document.getElementById('player');
const closeBtn = document.getElementById('close');
const filters = document.getElementById('filters');
const year = document.getElementById('year');

let videos = [];

function escapeHTML(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function getYouTubeID(url) {
  const match = String(url || '').match(
    /(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : '';
}

function render(category = 'All') {
  const items = videos
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter(item => category === 'All' || item.category === category);

  grid.innerHTML = items.map(item => {
    const id = getYouTubeID(item.video);
    const thumbnail = item.thumbnail ||
      (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '');

    return `
      <article class="card" data-id="${item.originalIndex}">
        <div class="thumb">
          ${thumbnail ? `<img src="${escapeHTML(thumbnail)}" alt="${escapeHTML(item.title)}">` : ''}
          <span class="tag">${escapeHTML(item.category)}</span>
          <span class="play">▶</span>
        </div>
        <div class="info">
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.description)}</p>
        </div>
      </article>
    `;
  }).join('');

  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      playVideo(videos[Number(card.dataset.id)]);
    });
  });
}

function playVideo(item) {
  if (!item || !item.video) return;

  const id = getYouTubeID(item.video);

  if (id) {
    player.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${id}?autoplay=1"
        title="${escapeHTML(item.title)}"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen>
      </iframe>
    `;
  } else {
    player.innerHTML = `
      <video controls autoplay playsinline>
        <source src="${escapeHTML(item.video)}">
      </video>
    `;
  }

  modal.classList.add('open');
}

function closePlayer() {
  modal.classList.remove('open');
  player.innerHTML = '';
}

if (closeBtn) closeBtn.addEventListener('click', closePlayer);

if (modal) {
  modal.addEventListener('click', event => {
    if (event.target === modal) closePlayer();
  });
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closePlayer();
});

if (filters) {
  filters.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;

    filters.querySelectorAll('button').forEach(item => {
      item.classList.remove('active');
    });

    button.classList.add('active');
    render(button.dataset.cat);
  });
}

if (year) year.textContent = new Date().getFullYear();

fetch('./videos.json')
  .then(response => {
    if (!response.ok) throw new Error('Could not load videos.json');
    return response.json();
  })
  .then(data => {
    videos = data;
    render();
  })
  .catch(error => {
    console.error(error);
    grid.innerHTML = '<p>Videos could not load. Please check videos.json.</p>';
  });
