let selectedArticles = [];
let currentIndex = 0;
let isRevealed = false;

// サイドバー開閉（モバイル用）
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
}

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

      const btn = document.createElement('button');
      btn.className = 'article-btn';
      btn.dataset.id = String(articleId);

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.dataset.id = String(articleId);
      cb.addEventListener('change', updateSelection);
      cb.addEventListener('click', e => e.stopPropagation());

      const span = document.createElement('span');
      span.textContent = label;

      btn.appendChild(cb);
      btn.appendChild(span);

      btn.addEventListener('click', () => {
        cb.checked = !cb.checked;
        updateSelection();
      });

      articleList.appendChild(btn);
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
  closeSidebar();
  showArticle(selectedArticles[currentIndex]);
}

function showArticle(articleId) {
  isRevealed = false;
  const article = ARTICLES[articleId];
  const main = document.getElementById('main');

  if (!article) {
    main.innerHTML = '<div class="empty-state">条文データがありません</div>';
    return;
  }

  // アクティブ表示
  document.querySelectorAll('.article-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.article-btn[data-id="${articleId}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  const total = selectedArticles.length;
  const current = currentIndex + 1;
  const titleText = articleId === 'preamble'
    ? '前文'
    : `第${articleId}条${article.title ? '　' + article.title : ''}`;

  const paragraphs = Array.isArray(article.text) ? article.text : [article.text];
  const textHtml = paragraphs.map(p => `<p style="margin-bottom:1em;line-height:2.2;">${p}</p>`).join('');

  main.innerHTML = `
    <div class="practice-card">
      ${total > 1 ? `<div class="progress">${current} / ${total}</div>` : ''}
      <div class="article-number">${titleText}</div>
      <div class="text-area">
        <div class="hidden-text" id="article-text">${textHtml}</div>
      </div>
      <button class="reveal-btn" id="reveal-btn" onclick="toggleReveal()">条文を表示</button>
      <div class="nav-btns">
        <button class="nav-btn" onclick="navigate(-1)" ${currentIndex === 0 ? 'disabled' : ''}>← 前の条文</button>
        <button class="nav-btn" onclick="navigate(1)" ${currentIndex >= total - 1 ? 'disabled' : ''}>次の条文 →</button>
      </div>
    </div>
  `;

  // ページ先頭へ
  main.scrollTo(0, 0);
}

function toggleReveal() {
  isRevealed = !isRevealed;
  document.getElementById('article-text').classList.toggle('revealed', isRevealed);
  const btn = document.getElementById('reveal-btn');
  btn.textContent = isRevealed ? '隠す' : '条文を表示';
  btn.classList.toggle('revealed', isRevealed);
}

function navigate(dir) {
  const next = currentIndex + dir;
  if (next < 0 || next >= selectedArticles.length) return;
  currentIndex = next;
  showArticle(selectedArticles[currentIndex]);
}

buildSidebar();
