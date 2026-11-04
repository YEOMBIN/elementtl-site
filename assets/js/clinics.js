/* 도입 병원 찾기 — 병원 목록 · 전국 SVG 지도(시·도 단위 핀) · 네이버 지도 링크 · 지역 필터 · 검색
   외부 지도 API 없이 assets/js/korea-map.js(시·도 경계 SVG 경로)로 그립니다. 위치는 지역 단위로만 표시합니다. */
(function () {
  const CLINICS = [
    { name: '연세코스모의원', group: '경기', area: '광명', addr: '경기 광명시 광명로 907, 3층', q: '연세코스모의원 광명' },
    { name: '리앤샤인의원', group: '경기', area: '평택', addr: '경기 평택시 용죽3로 18, 2층', q: '리앤샤인의원 평택' },
    { name: '목동제이의원', group: '서울', area: '강서', addr: '서울 강서구 등촌로 29, 3층', q: '목동제이의원 화곡' },
    { name: '미셀의원', group: '서울', area: '양천', addr: '서울 양천구 등촌로 6, 2층', q: '미셀의원 목동' },
    { name: '닥터에버스의원 일산점', group: '경기', area: '일산', addr: '경기 고양시 일산동구 정발산로 38, 3층 304호', q: '닥터에버스의원 일산' },
    { name: '이소진의원', group: '서울', area: '성북', addr: '서울 성북구 보국문로 50, 201·202호', q: '이소진의원 정릉' },
    { name: '타임피부과의원', group: '대전', area: '대전', addr: '대전 서구 둔산중로 50', q: '타임피부과의원 대전' },
    { name: '연세피움의원', group: '울산', area: '울산', addr: '울산 북구 매산로 15, 4층', q: '연세피움의원 울산' },
    { name: '소사벌다시봄날의원', group: '경기', area: '평택', addr: '경기 평택시 평남로 941, 6층', q: '소사벌다시봄날의원 평택' },
    { name: '엑셀브이의원', group: '서울', area: '송파', addr: '서울 송파구 석촌호수로 61, 2층 235호', q: '엑셀브이의원 송파' },
    { name: '탑라인의원', group: '경기', area: '성남', addr: '경기 성남시 중원구 산성대로 80, 6층', q: '탑라인의원 성남' },
    { name: '닥터킨베인의원', group: '인천', area: '검단', addr: '인천 검단구 원당대로 840, 2·3층', q: '닥터킨베인의원 인천' },
  ];

  const list = document.querySelector('.clinic-list');
  const mapBox = document.getElementById('clinic-map');
  if (!list || !mapBox) return;

  const naver = c => 'https://map.naver.com/p/search/' + encodeURIComponent(c.q);
  const google = c => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(c.name + ' ' + c.addr);
  const REG = { '서울': '11', '인천': '23', '경기': '31', '대전': '25', '울산': '26' };
  // 핀 위치(지도 좌표) — 수도권 3곳은 서로 겹치지 않도록 분산
  const PIN = { '서울': [240, 140, 'top'], '인천': [196, 154, 'left'], '경기': [294, 176, 'right'], '대전': [282, 283, 'right'], '울산': [458, 381, 'left'] };
  const M = window.KOREA_MAP, NS = 'http://www.w3.org/2000/svg';
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const svg = el('svg', { viewBox: '0 0 ' + M.w + ' ' + M.h, class: 'kmap', role: 'group', 'aria-label': '대한민국 도입 병원 분포 지도' });
  const regs = {}, pins = {};
  Object.entries(M.r).forEach(([code, r]) => {
    const g = Object.keys(REG).find(k => REG[k] === code);
    const p = el('path', { d: r.d, class: 'kmap__r' + (g ? ' has' : '') }, svg);
    if (g) { regs[g] = p; p.addEventListener('click', () => pickGroup(group === g ? '전체' : g)); }
  });
  Object.entries(PIN).forEach(([g, [x, y, side]]) => {
    const pg = el('g', { class: 'kmap__pin', transform: 'translate(' + x + ' ' + y + ')', tabindex: 0, role: 'button', 'aria-label': g + ' 도입 병원' }, svg);
    const inner = el('g', { class: 'kmap__pin-in' }, pg);
    el('circle', { r: 11, class: 'kmap__ring' }, inner);
    el('circle', { r: 5.5, class: 'kmap__dot' }, inner);
    const dx = side === 'left' ? -18 : side === 'right' ? 18 : 0, dy = side === 'top' ? -20 : 5;
    const t = el('text', { x: dx, y: dy, class: 'kmap__lbl', 'text-anchor': side === 'left' ? 'end' : side === 'right' ? 'start' : 'middle' }, inner);
    pg.addEventListener('click', () => pickGroup(group === g ? '전체' : g));
    pg.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickGroup(group === g ? '전체' : g); } });
    pins[g] = { pg, t };
  });
  Object.values(pins).forEach((p, i) => p.pg.style.setProperty('--i', i));
  mapBox.appendChild(svg);
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { mapBox.classList.add('is-in'); io.disconnect(); } }), { threshold: 0.25 }); io.observe(mapBox); } else mapBox.classList.add('is-in');

  let active = -1;
  const items = CLINICS.map((c, i) => {
    const card = document.createElement('article');
    card.className = 'ccard';
    card.tabIndex = 0;
    card.innerHTML = `<div class="ccard__top"><h3>${c.name}</h3><span>${c.area}</span></div>
      <p><span>${c.addr}</span></p>
      <div class="acts"><a href="${google(c)}" target="_blank" rel="noopener">구글 지도</a><a href="${naver(c)}" target="_blank" rel="noopener">네이버 지도</a></div>`;
    card.addEventListener('click', e => { if (!e.target.closest('a')) select(i); });
    card.addEventListener('keydown', e => { if (e.key === 'Enter') select(i); });
    return { c, card };
  });

  const empty = document.createElement('p');
  empty.className = 'clinic-empty';
  empty.textContent = '해당 조건의 도입 병원 정보가 아직 없습니다.';

  function select(i) {
    if (active > -1) items[active].card.classList.remove('is-active');
    active = i;
    items[i].card.classList.add('is-active');
    paint();
  }

  let group = '전체', query = '';
  function apply() {
    list.innerHTML = '';
    const shown = items.filter(({ c }) =>
      (group === '전체' || c.group === group) &&
      (!query || (c.name + c.area + c.group + c.addr).includes(query)));
    if (!shown.length) { list.appendChild(empty); paint(shown); return; }
    shown.forEach(it => list.appendChild(it.card));
    if (active > -1 && !shown.includes(items[active])) { items[active].card.classList.remove('is-active'); active = -1; }
    paint(shown);
  }

  const chips = [...document.querySelectorAll('.clinic-filter [data-chips] .chip')];
  function paint(shown) {
    shown = shown || items.filter(({ c }) => (group === '전체' || c.group === group) && (!query || (c.name + c.area + c.group + c.addr).includes(query)));
    Object.entries(pins).forEach(([g, p]) => {
      const n = shown.filter(({ c }) => c.group === g).length;
      p.t.textContent = g + ' ' + n;
      p.pg.classList.toggle('is-off', !n);
      p.pg.classList.toggle('is-sel', group === g);
      p.pg.classList.toggle('is-act', active > -1 && items[active].c.group === g);
      regs[g].classList.toggle('is-sel', group === g);
    });
  }
  function pickGroup(g) {
    group = g;
    chips.forEach(c => c.classList.toggle('is-active', c.textContent.trim() === g));
    apply();
  }
  chips.forEach(chip => chip.addEventListener('click', e => { e.preventDefault(); pickGroup(chip.textContent.trim()); }));
  const form = document.querySelector('.clinic-filter .search');
  const input = form?.querySelector('input');
  form?.addEventListener('submit', e => { e.preventDefault(); query = input.value.trim(); apply(); });
  input?.addEventListener('input', () => { query = input.value.trim(); apply(); });

  apply();
})();
