/* 도입 병원 찾기 — 병원 목록 · 구글 지도 연동(주소 기반 임베드) · 네이버 지도 링크 · 지역 필터 · 검색
   구글 지도 임베드는 API 키 없이 주소 검색으로 위치를 표시합니다. 정확한 좌표 마커가 필요하면 지도 API 키 발급 후 교체합니다. */
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
  const embed = (query, zoom) => `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&hl=ko&output=embed`;

  const frame = document.createElement('iframe');
  frame.className = 'map__frame';
  frame.title = '도입 병원 위치 (구글 지도)';
  frame.referrerPolicy = 'no-referrer-when-downgrade';
  frame.allowFullscreen = true;
  mapBox.appendChild(frame);
  const show = (query, zoom) => { const src = embed(query, zoom); if (frame.getAttribute('src') !== src) frame.src = src; };
  const overview = g => show(g === '전체' ? '대한민국' : g, g === '전체' ? 7 : 10);

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
    show(items[i].c.name + ' ' + items[i].c.addr, 16);
  }

  let group = '전체', query = '';
  function apply() {
    list.innerHTML = '';
    const shown = items.filter(({ c }) =>
      (group === '전체' || c.group === group) &&
      (!query || (c.name + c.area + c.group + c.addr).includes(query)));
    if (!shown.length) { list.appendChild(empty); return; }
    shown.forEach(it => list.appendChild(it.card));
    if (active > -1 && !shown.includes(items[active])) { items[active].card.classList.remove('is-active'); active = -1; }
  }

  document.querySelectorAll('.clinic-filter [data-chips] .chip').forEach(chip => chip.addEventListener('click', e => {
    e.preventDefault();
    group = chip.textContent.trim();
    apply();
    if (active === -1) overview(group);
  }));
  const form = document.querySelector('.clinic-filter .search');
  const input = form?.querySelector('input');
  form?.addEventListener('submit', e => { e.preventDefault(); query = input.value.trim(); apply(); });
  input?.addEventListener('input', () => { query = input.value.trim(); apply(); });

  apply();
  overview('전체');
})();
