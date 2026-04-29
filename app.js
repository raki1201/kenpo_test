let selectedArticles = [];
let currentIndex = 0;
let revealedCount = 0;

function openSidebar() {
  document.getElementById('sidebar').style.display = 'flex';
  document.getElementById('overlay').style.display = 'block';
}
function closeSidebar() {
  document.getElementById('sidebar').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
}
function toggleSidebar() { openSidebar(); }

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
  revealedCount = 0;
  closeSidebar();
  renderArticle();
}

function getParagraphs(articleId) {
  const article = ARTICLES[articleId];
  if (!article) return [];
  return Array.isArray(article.text) ? article.text : [article.text];
}

function renderArticle() {
  const articleId = selectedArticles[currentIndex];
  const article = ARTICLES[articleId];
  const main = document.getElementById('main');

  if (!article) {
    main.innerHTML = '<div class="empty-state">条文データがありません</div>';
    return;
  }

  const paragraphs = getParagraphs(articleId);
  const totalArticles = selectedArticles.length;
  const allRevealed = revealedCount >= paragraphs.length;

  const titleText = articleId === 'preamble'
    ? '前文'
    : `第${articleId}条${article.title ? '　' + article.title : ''}`;

  // アクティブ表示
  document.querySelectorAll('.article-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.article-btn[data-id="${articleId}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  const paragraphsHtml = paragraphs.map((p, i) => {
    const revealed = i < revealedCount;
    return `<div class="para-block ${revealed ? 'para-revealed' : 'para-hidden'}">${p}</div>`;
  }).join('');

  let revealBtn;
  if (allRevealed) {
    revealBtn = `<button class="reveal-btn reveal-btn--done" disabled>全て表示済み ✓</button>`;
  } else {
    const label = paragraphs.length > 1
      ? `${revealedCount + 1}行目を表示　(${revealedCount + 1} / ${paragraphs.length})`
      : '表示する';
    revealBtn = `<button class="reveal-btn" onclick="revealNext()">${label}</button>`;
  }

  main.innerHTML = `
    <div class="practice-card">
      ${totalArticles > 1 ? `<div class="progress">条文 ${currentIndex + 1} / ${totalArticles}</div>` : ''}
      <div class="article-number">${titleText}</div>
      <div class="text-area">${paragraphsHtml}</div>
      ${revealBtn}
      <div class="nav-btns">
        <button class="nav-btn" onclick="navigate(-1)" ${currentIndex === 0 ? 'disabled' : ''}>← 前の条文</button>
        <button class="nav-btn" onclick="navigate(1)" ${currentIndex >= totalArticles - 1 ? 'disabled' : ''}>次の条文 →</button>
      </div>
    </div>
  `;

  main.scrollTo(0, 0);
}

function revealNext() {
  const paragraphs = getParagraphs(selectedArticles[currentIndex]);
  if (revealedCount < paragraphs.length) {
    revealedCount++;
    renderArticle();
  }
}

function navigate(dir) {
  const next = currentIndex + dir;
  if (next < 0 || next >= selectedArticles.length) return;
  currentIndex = next;
  revealedCount = 0;
  renderArticle();
}

buildSidebar();
