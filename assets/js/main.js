/* 엘레멘트티엘 Gen2 — 홈페이지 시안 공통 스크립트 */
(function () {
  const ARROW = '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CHEV = '<svg viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>';
  const BLOG = 'https://blog.naver.com/element_tl';

  const MENU = [
    { key: 'product', label: '제품소개', en: 'Product', href: 'product.html', sub: [['엘레멘트티엘 Gen2', 'product.html']] },
    { key: 'news', label: '공지사항', en: 'News', href: 'press.html', sub: [['보도자료', 'press.html'], ['학회 & 전시', 'conference.html'], ['블로그', 'blog.html']] },
    { key: 'support', label: '고객지원', en: 'Support', href: 'inquiry.html', sub: [['제품 도입 문의', 'inquiry.html'], ['데모 신청', 'demo.html']] },
    { key: 'clinics', label: '병원찾기', en: 'Clinics', href: 'clinics.html', sub: [['도입 병원 찾기', 'clinics.html']] },
  ];
  const LANGS = [['한국어 (KO)', true], ['English (EN)'], ['简体中文'], ['繁體中文'], ['日本語']];

  const active = document.body.dataset.page || '';

  /* ---------- Header ---------- */
  const header = document.getElementById('site-header');
  if (header) {
    header.className = 'site-header';
    header.innerHTML = `
      <div class="hd">
        <a class="logo" href="index.html" aria-label="엘레멘트티엘 홈"><img src="assets/img/logo-white.png" alt="엘레멘트티엘"></a>
        <ul class="gnb">${MENU.map(m => `<li><a href="${m.href}" class="${m.key === active ? 'is-active' : ''}">${m.label}</a><div class="gnb__sub">${m.sub.map(([l, h]) => `<a href="${h}">${l}</a>`).join('')}</div></li>`).join('')}</ul>
        <div class="util">
          <div class="lang"><button class="lang__btn" type="button" aria-haspopup="true">KOR ${CHEV}</button>
            <div class="lang__list">${LANGS.map(([l, on]) => `<a href="#"${on ? ' aria-current="true"' : ''}>${l}</a>`).join('')}</div></div>
          <a class="btn btn--primary" href="inquiry.html">제품 도입 문의 ${ARROW}</a>
          <button class="menu-btn" type="button" aria-label="메뉴 열기"><span></span></button>
        </div>
      </div>
      <div class="mega"><div class="mega__in">
        <div class="mega__quick">
          <a href="product.html#download"><span><b>카탈로그 다운로드</b><small>의료진 전용 · PDF</small></span>${ARROW}</a>
          <a href="demo.html"><span><b>데모 신청</b><small>방문 시연 일정 조율</small></span>${ARROW}</a>
        </div>
      </div></div>
      <nav class="mnav" aria-label="모바일 메뉴">
        ${MENU.map(m => `<div class="mnav__item"><a href="${m.href}">${m.label}<small>${m.en}</small></a><div class="mnav__sub">${m.sub.map(([l, h]) => `<a href="${h}">${l}</a>`).join('')}</div></div>`).join('')}
        <div class="mnav__lang"><span class="overline">Language</span><div class="chips">${LANGS.map(([l, on]) => `<a class="chip${on ? ' is-active' : ''}" href="#">${l.replace(/ \(.+\)/, '')}</a>`).join('')}</div></div>
        <a class="btn btn--white" href="inquiry.html">제품 도입 문의 ${ARROW}</a>
      </nav>`;

    const gnb = header.querySelector('.gnb');
    const mega = header.querySelector('.mega');
    let megaTimer;
    const openMega = () => { clearTimeout(megaTimer); header.classList.add('is-mega'); };
    const closeMega = () => { megaTimer = setTimeout(() => header.classList.remove('is-mega'), 160); };
    gnb.addEventListener('mouseenter', openMega);
    gnb.addEventListener('mouseleave', closeMega);
    mega.addEventListener('mouseenter', openMega);
    mega.addEventListener('mouseleave', closeMega);

    const lang = header.querySelector('.lang');
    lang.querySelector('.lang__btn').addEventListener('click', e => { e.stopPropagation(); lang.classList.toggle('is-open'); });
    document.addEventListener('click', () => lang.classList.remove('is-open'));

    header.querySelector('.menu-btn').addEventListener('click', () => {
      header.classList.toggle('is-open');
      document.body.style.overflow = header.classList.contains('is-open') ? 'hidden' : '';
    });

    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Footer ---------- */
  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="wrap">
        <div class="ft-top">
          <div>
            <a class="logo" href="index.html" aria-label="엘레멘트티엘 홈"><img src="assets/img/logo-white.png" alt="엘레멘트티엘"></a>
            <p class="ft-info">공식 대리점 [상호] · 대표 [성명] · 사업자등록번호 [000-00-00000]<br>주소 [대리점 주소] · 제조 엘레메닉<br>의료기기 허가번호 [입력 예정] · 의료기기 광고심의필 [번호]</p>
          </div>
          <div class="ft-links"><a href="#">개인정보처리방침</a><a href="#">이용약관</a><a href="${BLOG}" target="_blank" rel="noopener">Blog</a><a href="#">Instagram</a><a href="#">KakaoTalk</a></div>
        </div>
      </div>
      <div class="ft-mark" aria-hidden="true"><img src="assets/img/logo-white.png" alt=""></div>
      <div class="wrap"><p class="ft-bottom">© 2026 엘레멘트티엘. All rights reserved.<span>본 제품은 의료기기이며, 사용상의 주의사항과 사용방법을 잘 읽고 사용하십시오.</span></p></div>`;
  }

  /* ---------- Floating CTA ---------- */
  if (!document.body.dataset.noFloat) {
    const f = document.createElement('a');
    f.className = 'float-cta';
    f.href = 'inquiry.html';
    f.innerHTML = `<span class="en">INQUIRY</span><span class="kr">제품 도입 문의</span>${ARROW}`;
    document.body.appendChild(f);
  }

  /* ---------- Laser line field (original graphic) ---------- */
  function laserSVG(w, h, n, seed) {
    let paths = '';
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const amp = h * 0.18 * (0.6 + 0.8 * Math.sin(t * Math.PI));
      const ph = seed + t * 2.2;
      const base = h * 0.55 + (t - 0.5) * h * 0.35;
      let d = '';
      for (let x = 0; x <= w; x += 16) {
        const u = x / w;
        const y = base + amp * Math.sin(u * Math.PI * 2.1 + ph) * Math.sin(u * Math.PI) + h * 0.06 * Math.sin(u * Math.PI * 5 + ph * 1.7);
        d += (x === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
      }
      const op = (0.12 + 0.55 * Math.pow(Math.sin(t * Math.PI), 3)).toFixed(2);
      paths += `<path d="${d}" stroke="url(#lg${seed})" stroke-width="${i % 6 === 0 ? 1.4 : 0.8}" stroke-opacity="${op}" fill="none" vector-effect="non-scaling-stroke"/>`;
    }
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="lg${seed}" x1="0" y1="0" x2="${w}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2F6BFF" stop-opacity="0"/><stop offset="0.3" stop-color="#2F6BFF"/><stop offset="0.62" stop-color="#A9C3FF"/><stop offset="0.85" stop-color="#2F6BFF"/><stop offset="1" stop-color="#2F6BFF" stop-opacity="0"/></linearGradient></defs>${paths}</svg>`;
  }
  document.querySelectorAll('.laser').forEach((el, i) => { el.innerHTML = laserSVG(1440, 560, 42, i + 0.4); });

  /* ---------- Wavelength beam stage (400–1100nm, true scale) ---------- */
  const beam = document.querySelector('.beam');
  if (beam) {
    const W = 1200, AX = 360, X = l => (l - 400) / 700 * W;
    const C = { 532: '#EE4540', 755: '#F3A31B', 1064: '#2F7FE0' };
    let s = `<svg viewBox="0 -30 ${W} 450" aria-label="400–1100nm 파장 눈금 위 532·755·1064nm 위치"><defs>
      <linearGradient id="axis" x1="0" x2="1"><stop offset="0" stop-color="#9AABB9" stop-opacity=".15"/><stop offset=".43" stop-color="#9AABB9" stop-opacity=".6"/><stop offset="1" stop-color="#9AABB9" stop-opacity=".25"/></linearGradient>`;
    for (const l of [532, 755, 1064]) s += `<linearGradient id="b${l}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C[l]}" stop-opacity="0"/><stop offset="1" stop-color="${C[l]}"/></linearGradient><radialGradient id="g${l}"><stop offset="0" stop-color="${C[l]}" stop-opacity=".7"/><stop offset="1" stop-color="${C[l]}" stop-opacity="0"/></radialGradient>`;
    // Unselected wavelengths: same beam drawn in the axis silver (grayscale)
    s += `<linearGradient id="bGray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9AABB9" stop-opacity="0"/><stop offset="1" stop-color="#9AABB9" stop-opacity=".7"/></linearGradient><radialGradient id="gGray"><stop offset="0" stop-color="#9AABB9" stop-opacity=".35"/><stop offset="1" stop-color="#9AABB9" stop-opacity="0"/></radialGradient>`;
    s += `</defs><rect x="0" y="${AX}" width="${W}" height="2" fill="url(#axis)"/>`;
    for (let l = 400; l <= 1100; l += 50) {
      const major = l % 100 === 0, keep = [400, 700, 1100].includes(l);
      s += `<rect class="${keep ? '' : 'minor'}" x="${X(l)}" y="${AX + 8}" width="1" height="${major ? 10 : 5}" fill="#fff" fill-opacity="${major ? 0.4 : 0.12}"/>`;
      if (major) s += `<text class="${keep ? '' : 'minor'}" x="${X(l)}" y="${AX + 40}" fill="#fff" fill-opacity=".4" font-size="13" text-anchor="middle">${l}</text>`;
    }
    s += `<text x="6" y="${AX - 16}" fill="#fff" fill-opacity=".4" font-size="12" font-weight="600">VISIBLE</text><text x="${X(700) + 6}" y="${AX - 16}" fill="#fff" fill-opacity=".4" font-size="12" font-weight="600">NEAR-INFRARED</text><rect x="${X(700)}" y="${AX - 30}" width="1" height="24" fill="#fff" fill-opacity=".1"/>`;
    for (const l of [532, 755, 1064]) {
      const x = X(l);
      s += `<g class="beam-l" data-w="${l}">
        <g class="beam-gray"><rect x="${x - 1}" y="20" width="2" height="${AX - 20}" fill="url(#bGray)"/><circle cx="${x}" cy="${AX}" r="60" fill="url(#gGray)"/></g>
        <g class="beam-color"><rect x="${x - 1}" y="20" width="2" height="${AX - 20}" fill="url(#b${l})"/><circle cx="${x}" cy="${AX}" r="60" fill="url(#g${l})"/></g>
        <circle cx="${x}" cy="${AX}" r="6" fill="#fff"/>
        <text class="lbl" x="${Math.min(x, W - 50)}" y="6" fill="#fff" font-size="22" text-anchor="middle">${l}nm</text></g>`;
    }
    beam.innerHTML = s + '</svg>';
  }

  const WAVES = {
    1064: { med: 'Nd:YAG · Near-Infrared', t: '근적외선 영역의 가장 긴 파장', d: '세 파장 중 가장 긴 파장으로, 상대적으로 깊은 층까지 도달합니다.' },
    755: { med: 'Alexandrite · Near-Infrared', t: '가시광선 경계에 가까운 근적외선 파장', d: '세 파장 중 중간 파장으로, 중간 깊이에 작용합니다.' },
    532: { med: 'KTP · Visible Green', t: '가시광선 영역의 가장 짧은 파장', d: '세 파장 중 가장 짧은 파장으로, 상대적으로 얕은 층에 작용합니다.' },
  };
  const panel = document.querySelector('.w-panel');
  document.querySelectorAll('.w-tab').forEach(tab => tab.addEventListener('click', () => {
    const w = tab.dataset.w;
    document.querySelectorAll('.w-tab').forEach(t => t.classList.toggle('is-active', t === tab));
    document.querySelectorAll('.beam-l').forEach(g => {
      const on = g.dataset.w === w;
      g.classList.toggle('is-on', on); // selected = color, others = grayscale (CSS crossfade)
      g.querySelector('.lbl').setAttribute('fill-opacity', on ? 1 : 0.4);
    });
    if (panel) {
      const d = WAVES[w];
      panel.innerHTML = `<div class="w-panel__num"><span>${w}<small>nm</small></span></div><div class="w-panel__body"><p class="overline" style="color:var(--blue-200)">${d.med}</p><h3 class="h3">${d.t}</h3><p class="body">${d.d}</p></div>`;
      panel.removeAttribute('data-anim'); void panel.offsetWidth; panel.setAttribute('data-anim', '');
    }
  }));
  const firstTab = document.querySelector('.w-tab.is-active');
  if (firstTab) firstTab.click();

  /* ---------- Carousels ---------- */
  /* Infinite, centered carousel: [clones][originals][clones]; the active card sits at the viewport center
     and the index is silently re-based into the middle set after each move. */
  document.querySelectorAll('[data-carousel]').forEach(root => {
    const view = root.querySelector('.carousel');
    const cards = [...view.querySelectorAll('.ncard')];
    const N = cards.length;
    if (!N) return;
    const bar = root.querySelector('.car-bar i');
    const track = document.createElement('div');
    track.className = 'carousel__track';
    const clone = c => { const k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.tabIndex = -1; return k; };
    cards.forEach(c => track.appendChild(clone(c)));
    cards.forEach(c => track.appendChild(c));
    cards.forEach(c => track.appendChild(clone(c)));
    view.appendChild(track);
    const all = [...track.children];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let i = N + (N > 1 ? 1 : 0); // Figma: second item (first blog post) starts centered
    let dragX = 0;

    const pitch = () => all[0].offsetWidth + parseFloat(getComputedStyle(track).columnGap || 0);
    const offset = () => view.clientWidth / 2 - all[0].offsetWidth / 2 - i * pitch() + dragX;
    function render(animate = true) {
      track.classList.toggle('no-anim', !animate);
      track.style.transform = `translate3d(${offset()}px,0,0)`;
      all.forEach((c, k) => c.classList.toggle('is-center', k === i));
      if (bar) { const pos = ((i - N) % N + N) % N; bar.style.width = 100 / N + '%'; bar.style.left = pos * 100 / N + '%'; }
    }
    function rebase() {
      if (i < 2 * N && i >= N) return;
      i = ((i - N) % N + N) % N + N;
      render(false);
      void track.offsetWidth; // commit the jump before the next animated move
    }
    function go(d) { rebase(); i += d; render(true); }
    track.addEventListener('transitionend', e => { if (e.target === track) rebase(); });
    root.querySelector('[data-prev]')?.addEventListener('click', () => go(-1));
    root.querySelector('[data-next]')?.addEventListener('click', () => go(1));

    // Drag / swipe
    let startX = null, moved = false;
    view.addEventListener('pointerdown', e => { if (e.button !== 0) return; startX = e.clientX; moved = false; });
    window.addEventListener('pointermove', e => {
      if (startX === null) return;
      dragX = e.clientX - startX;
      if (Math.abs(dragX) > 6 && !moved) { moved = true; view.classList.add('is-dragging'); }
      if (moved) render(false);
    });
    window.addEventListener('pointerup', () => {
      if (startX === null) return;
      const d = dragX; startX = null; dragX = 0; view.classList.remove('is-dragging');
      if (Math.abs(d) > 60) go(d < 0 ? 1 : -1); else render(true);
    });
    view.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } }, true);

    // Slow autoplay; pauses while hovered / focused / dragged, off for reduced motion
    let timer;
    const play = () => { if (reduce) return; clearInterval(timer); timer = setInterval(() => { if (startX === null) go(1); }, 5000); };
    const stop = () => clearInterval(timer);
    root.addEventListener('mouseenter', stop); root.addEventListener('mouseleave', play);
    root.addEventListener('focusin', stop); root.addEventListener('focusout', play);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()));

    window.addEventListener('resize', () => render(false));
    render(false);
    play();
  });

  /* ---------- Clinical case carousel dots (tablet / mobile) ---------- */
  const cases = document.querySelector('.cases'), caseDots = document.querySelector('.cases-dots');
  const visibleCases = () => [...document.querySelectorAll('.case')].filter(c => !c.hidden);
  function buildCaseDots() {
    if (!cases || !caseDots) return;
    caseDots.innerHTML = '';
    visibleCases().forEach(c => {
      const d = document.createElement('button');
      d.type = 'button';
      d.addEventListener('click', () => cases.scrollTo({ left: c.offsetLeft - cases.offsetLeft - parseFloat(getComputedStyle(cases).scrollPaddingLeft || 0), behavior: 'smooth' }));
      caseDots.appendChild(d);
    });
    cases.scrollLeft = 0;
    syncCaseDots();
  }
  function syncCaseDots() {
    if (!cases || !caseDots) return;
    const list = visibleCases(), x = cases.scrollLeft;
    let on = 0;
    list.forEach((c, i) => { if (Math.abs(c.offsetLeft - cases.offsetLeft - x) < Math.abs(list[on].offsetLeft - cases.offsetLeft - x)) on = i; });
    [...caseDots.children].forEach((d, i) => d.classList.toggle('is-on', i === on));
  }
  if (cases) { cases.addEventListener('scroll', syncCaseDots, { passive: true }); buildCaseDots(); }

  /* ---------- Clinical case filter ---------- */
  document.querySelectorAll('.ftab').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.ftab').forEach(x => x.classList.toggle('is-active', x === b));
    const f = b.dataset.filter;
    let n = 0;
    document.querySelectorAll('.case').forEach(c => { const show = f === 'all' || c.dataset.w.split(' ').includes(f); c.hidden = !show; if (show) n++; });
    const cnt = document.querySelector('.ftabs__count b');
    if (cnt) cnt.textContent = n;
    buildCaseDots();
  }));

  /* ---------- Chip groups (visual toggle only) ---------- */
  document.querySelectorAll('[data-chips]').forEach(g => g.addEventListener('click', e => {
    const c = e.target.closest('.chip'); if (!c) return;
    e.preventDefault();
    g.querySelectorAll('.chip').forEach(x => x.classList.toggle('is-active', x === c));
  }));

  /* ---------- Anchor tabs (product page) ---------- */
  const anchors = document.querySelectorAll('.anchors a');
  if (anchors.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) anchors.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    anchors.forEach(a => { const t = document.querySelector(a.getAttribute('href')); if (t) io.observe(t); });
  }

  /* ---------- Reveal on enter (short, eased) ---------- */
  const rv = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.15 });
    rv.forEach(el => io.observe(el));
  } else rv.forEach(el => el.classList.add('is-in'));

  /* ---------- Toast for placeholder actions ---------- */
  const toast = document.createElement('div');
  toast.className = 'toast';
  document.body.appendChild(toast);
  let tt;
  const say = msg => { toast.textContent = msg; toast.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('is-on'), 2600); };
  document.querySelectorAll('form').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); say('시안 페이지입니다. 실제 전송 기능은 개발 단계에서 연결됩니다.'); }));
  document.querySelectorAll('[data-todo]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); say(a.dataset.todo); }));
})();
