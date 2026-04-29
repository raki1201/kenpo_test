let selectedArticles = [];
let currentIndex = 0;
let isRevealed = false;

function buildSidebar() {
  const list = document.getElementById('chapter-list');
  list.innerHTML = '';

  CHAPTERS.forEach(chapter => {
    const section = document.createElement('div');
    section.className = 'sidebar-section';

    const title = document.createElement('div');
    title.className = 'sidebar-section-title';
    title.textContent = chapter.title;
    section.appendChild(title);

    const articleList = document.createElement('div');
    articleList.className = 'article-list';

    chapter.articles.forEach(articleId => {
      const article = ARTICLES[articleId];
      const label = articleId === 'preamble'
        ? '前文'
        : `第${articleId}条${article && article.title ? '　' + article.title : ''}`;

      const row = document.createElement('label');
      row.className = 'article-btn';
      row.dataset.id = articleId;
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '8px';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.dataset.id = articleId;
      cb.addEventListener('change', updateSelection);

      const span = document.createElement('span');
      span.textContent = label;
      span.style.cursor = 'pointer';
      span.addEventListener('click', (e) => {
        e.preventDefault();
        selectedArticles = [String(articleId)];
        currentIndex = 0;
        showArticle(articleId);
        highlightActive(articleId);
      });

      row.appendChild(cb);
      row.appendChild(span);
      articleList.appendChild(row);
    });

    section.appendChild(articleList);
    list.appendChild(section);
  });
}

function updateSelection() {
  selectedArticles = [];
  document.querySelectorAll('.article-btn input[type=checkbox]:checked').forEach(cb => {
    selectedArticles.push(cb.dataset.id);
  });
  document.getElementById('start-btn').disabled = selectedArticles.length === 0;
}

function selectAll() {
  document.querySelectorAll('.article-btn input[type=checkbox]').forEach(cb => { cb.checked = true; });
  updateSelection();
}

function clearAll() {
  document.querySelectorAll('.article-btn input[type=checkbox]').forEach(cb => { cb.checked = false; });
  updateSelection();
}

function startPractice() {
  if (selectedArticles.length === 0) return;
  currentIndex = 0;
  showArticle(selectedArticles[currentIndex]);
}

function highlightActive(articleId) {
  document.querySelectorAll('.article-btn').forEach(btn => btn.classList.remove('active'));
  const target = document.querySelector(`.article-btn[data-id="${articleId}"]`);
  if (target) target.classList.add('active');
}

function showArticle(articleId) {
  isRevealed = false;
  const article = ARTICLES[articleId];
  const main = document.getElementById('main');

  if (!article) {
    main.innerHTML = '<div class="empty-state">条文データがまだ追加されていません</div>';
    return;
  }

  const total = selectedArticles.length;
  const current = currentIndex + 1;

  let titleText = articleId === 'preamble' ? '前文' : `第${articleId}条`;
  if (article.title) titleText += `　${article.title}`;

  const paragraphs = Array.isArray(article.text) ? article.text : [article.text];
  const textHtml = paragraphs.map(p => `<p style="margin-bottom:1em;line-height:2.2;">${p}</p>`).join('');

  main.innerHTML = `
    <div class="practice-card">
      ${total > 1 ? `<div class="progress">${current} / ${total}</div>` : ''}
      <div class="article-header">
        <div class="article-number">${titleText}</div>
      </div>
      <div class="text-area">
        <div class="hidden-text" id="article-text">${textHtml}</div>
      </div>
      <button class="reveal-btn" id="reveal-btn" onclick="toggleReveal()">条文を表示</button>
      <div class="nav-btns">
        <button class="nav-btn" onclick="navigate(-1)" ${currentIndex === 0 ? 'disabled' : ''}>← 前の条文</button>
        <button class="nav-btn" onclick="navigate(1)" ${currentIndex >= selectedArticles.length - 1 ? 'disabled' : ''}>次の条文 →</button>
      </div>
    </div>
  `;
}

function toggleReveal() {
  isRevealed = !isRevealed;
  const text = document.getElementById('article-text');
  const btn = document.getElementById('reveal-btn');
  if (isRevealed) {
    text.classList.add('revealed');
    btn.textContent = '隠す';
    btn.classList.add('revealed');
  } else {
    text.classList.remove('revealed');
    btn.textContent = '条文を表示';
    btn.classList.remove('revealed');
  }
}

function navigate(dir) {
  const next = currentIndex + dir;
  if (next < 0 || next >= selectedArticles.length) return;
  currentIndex = next;
  showArticle(selectedArticles[currentIndex]);
}

buildSidebar();
