(function () {
  const strip = document.getElementById('player-strip');
  const screen = document.getElementById('player-screen');
  const titleEl = document.getElementById('player-title');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnBack = document.getElementById('btn-back');

  let activeIconBtn = null;

  function clearScreen() {
    screen.innerHTML = '';
  }

  function showPlaceholder() {
    clearScreen();
    const p = document.createElement('div');
    p.className = 'player-placeholder';
    p.textContent = 'Pick a project below to load it here';
    screen.appendChild(p);
    titleEl.textContent = 'Select a project below';
    titleEl.classList.remove('active');
    btnFullscreen.disabled = true;
    btnBack.disabled = true;
  }

  function makeThumb(project, className) {
    if (project.thumbnail) {
      const img = document.createElement('img');
      img.className = className;
      img.src = project.thumbnail;
      img.alt = project.title;
      img.addEventListener('error', () => {
        img.replaceWith(makeMissingThumb(project, className));
      });
      return img;
    }
    return makeMissingThumb(project, className);
  }

  function makeMissingThumb(project, className) {
    const div = document.createElement('div');
    div.className = className + ' missing';
    div.textContent = (project.title || '?').charAt(0).toUpperCase();
    return div;
  }

  // Unlike the icon strip, the fallback card just skips the thumbnail
  // entirely when there's no real image — no letter-placeholder box.
  function makeFallbackThumb(project) {
    if (!project.thumbnail) return null;
    const img = document.createElement('img');
    img.className = 'fallback-thumb';
    img.src = project.thumbnail;
    img.alt = project.title;
    img.addEventListener('error', () => img.remove());
    return img;
  }

  function renderFallback(project) {
    clearScreen();
    const wrap = document.createElement('div');
    wrap.className = 'fallback-view';

    const thumb = makeFallbackThumb(project);
    if (thumb) wrap.appendChild(thumb);

    const body = document.createElement('div');
    body.className = 'fallback-body';

    const h3 = document.createElement('h3');
    h3.textContent = project.title;
    body.appendChild(h3);

    const p = document.createElement('p');
    p.textContent = project.description || '';
    body.appendChild(p);

    if (project.tech && project.tech.length) {
      const tags = document.createElement('div');
      tags.className = 'fallback-tags';
      project.tech.forEach(t => {
        const span = document.createElement('span');
        span.textContent = t;
        tags.appendChild(span);
      });
      body.appendChild(tags);
    }

    const actions = document.createElement('div');
    actions.className = 'fallback-actions';
    if (project.repo_url) {
      const a = document.createElement('a');
      a.href = project.repo_url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'View code →';
      actions.appendChild(a);
    }
    body.appendChild(actions);

    if (project.roadmap_note) {
      const note = document.createElement('p');
      note.className = 'roadmap-note';
      note.textContent = project.roadmap_note;
      body.appendChild(note);
    }

    wrap.appendChild(body);
    screen.appendChild(wrap);
  }

  function renderIframe(project) {
    clearScreen();
    const iframe = document.createElement('iframe');
    iframe.src = project.embed_url;
    iframe.title = project.title;
    iframe.loading = 'lazy';
    screen.appendChild(iframe);
  }

  function loadProject(project, iconBtn) {
    if (project.embed_mode === 'iframe' && project.embed_url) {
      renderIframe(project);
    } else {
      renderFallback(project);
    }

    titleEl.textContent = project.title;
    titleEl.classList.add('active');
    btnFullscreen.disabled = false;
    btnBack.disabled = false;

    if (activeIconBtn) activeIconBtn.classList.remove('active');
    iconBtn.classList.add('active');
    activeIconBtn = iconBtn;
  }

  function renderStrip(projects) {
    strip.innerHTML = '';
    projects.forEach(project => {
      const btn = document.createElement('button');
      btn.className = 'project-icon';
      btn.type = 'button';
      btn.title = project.tagline || project.title;

      btn.appendChild(makeThumb(project, 'icon-thumb'));

      const label = document.createElement('span');
      label.className = 'icon-label';
      label.textContent = project.title;
      btn.appendChild(label);

      btn.addEventListener('click', () => loadProject(project, btn));
      strip.appendChild(btn);
    });
  }

  btnBack.addEventListener('click', showPlaceholder);

  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      screen.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });

  fetch('data/projects.json')
    .then(res => res.json())
    .then(projects => {
      if (!projects || projects.length === 0) {
        strip.outerHTML = `<div class="empty-state">
          No projects added yet. Populate <code>data/projects.json</code> to fill the player.
        </div>`;
        return;
      }
      renderStrip(projects);
    })
    .catch(() => {
      strip.outerHTML = `<div class="empty-state">
        Couldn't load <code>data/projects.json</code>. Make sure the file exists
        in the <code>/data</code> folder next to this page.
      </div>`;
    });
})();
