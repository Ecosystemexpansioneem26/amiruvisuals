let data = [];

const grid = document.getElementById('grid');
const modal = document.getElementById('modal');
const player = document.getElementById('player');

const esc = value => String(value || '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;',
  '"': '&quot;', "'": '&#39;'
}[c]));

function render(category = 'All') {
  const items = data.filter(item =>
    category === 'All' || item.category === category
  );

  grid.innerHTML = items.map(item => `
    <article class="card">
      <div class="thumb">
        ${item.thumbnail ? `<img src="${esc(item.thumbnail)}" alt="">` : ''}
        <span class="tag">${esc(item.category)}</span>
        <span class="play">▶</span>
      </div>
      <div class="info">
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.description)}</p>
      </div>
    </article>
  `).join('');
}

function closePlayer() {
  modal.classList.remove('open');
  player.innerHTML = '';
}

document.getElementById('close').onclick = closePlayer;
modal.onclick = e => {
  if (e.target === modal) closePlayer();
};

document.getElementById('year').textContent =
  new Date().getFullYear();

document.getElementById('filters').onclick = e => {
  const button = e.target.closest('button');
  if (!button) return;

  document.querySelectorAll('.filters button')
    .forEach(b => b.classList.remove('active'));

  button.classList.add('active');
  render(button.dataset.cat);
};

fetch('videos.json')
  .then(response => response.json())
  .then(videos => {
    data = videos;
    render();
  })
  .catch(() => {
    grid.innerHTML = '<p>Could not load videos. Please check videos.json.</p>';
  });
