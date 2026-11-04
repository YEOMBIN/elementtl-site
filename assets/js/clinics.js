/* 도입 병원 찾기 — 병원 목록 · 지도(Leaflet + OpenStreetMap) · 지역 필터 · 검색 */
(function () {
  /* 병원 목록 (2026-11 전달 자료). 좌표는 전달받은 지역 기준의 대략 위치이며, 정확한 주소 확정 후 교체합니다.
     group: 지역 필터 칩 이름 / area: 카드에 표시할 지역 */
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
    // lat/lng 는 지도 API 또는 확인된 좌표가 있을 때만 추가합니다 (없으면 마커를 그리지 않음).
  ];

  const list = document.querySelector('.clinic-list');
  const mapBox = document.getElementById('clinic-map');
  if (!list || !mapBox || typeof L === 'undefined') return;

  const PIN = on => `<svg viewBox="0 0 16 16" width="30" height="30"><path d="M8 15s5-4.6 5-8.5A5 5 0 003 6.5C3 10.4 8 15 8 15z" fill="${on ? '#2f6bff' : '#142443'}"/><circle cx="8" cy="6.5" r="1.8" fill="#fff"/></svg>`;
  const icon = on => L.divIcon({ className: 'clinic-pin' + (on ? ' is-on' : ''), html: PIN(on), iconSize: [30, 30], iconAnchor: [15, 28], popupAnchor: [0, -26] });
  const route = c => 'https://map.naver.com/p/search/' + encodeURIComponent(c.q);

  const map = L.map(mapBox, { zoomControl: false, scrollWheelZoom: false, attributionControl: true });
  // OpenStreetMap standard tiles: no API key, Korean place names. Swap for Kakao / Naver maps when an app key is issued.
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  }).addTo(map);
  document.querySelector('[data-zoom="in"]')?.addEventListener('click', () => map.zoomIn());
  document.querySelector('[data-zoom="out"]')?.addEventListener('click', () => map.zoomOut());

  let active = -1;
  const items = CLINICS.map((c, i) => {
    const card = document.createElement('article');
    card.className = 'ccard';
    card.tabIndex = 0;
    card.innerHTML = `<div class="ccard__top"><h3>${c.name}</h3><span>${c.area}</span></div>
      <p><span>${c.addr}</span></p>
      <div class="acts"><a href="${route(c)}" target="_blank" rel="noopener">네이버 지도</a></div>`;
    const has = typeof c.lat === 'number' && typeof c.lng === 'number';
    const marker = has ? L.marker([c.lat, c.lng], { icon: icon(false), title: c.name, riseOnHover: true })
      .bindPopup(`<b>${c.name}</b><span>${c.group === c.area ? c.area : c.group + ' ' + c.area}</span>`, { closeButton: false, offset: [0, 0] })
      : null;
    marker?.on('click', () => select(i, { scrollCard: true }));
    card.addEventListener('click', e => { if (!e.target.closest('a')) select(i, { fly: true }); });
    card.addEventListener('keydown', e => { if (e.key === 'Enter') select(i, { fly: true }); });
    return { c, card, marker };
  });

  const empty = document.createElement('p');
  empty.className = 'clinic-empty';
  empty.textContent = '해당 조건의 도입 병원 정보가 아직 없습니다.';

  function select(i, { fly = false, scrollCard = false } = {}) {
    if (active > -1) { items[active].card.classList.remove('is-active'); items[active].marker?.setIcon(icon(false)); }
    active = i;
    const it = items[i];
    it.card.classList.add('is-active');
    if (it.marker) {
      it.marker.setIcon(icon(true));
      it.marker.setZIndexOffset(1000);
      if (fly) map.flyTo([it.c.lat, it.c.lng], Math.max(map.getZoom(), 12), { duration: 0.8 });
      it.marker.openPopup();
    }
    if (scrollCard) it.card.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }

  let group = '전체', query = '';
  function apply() {
    list.innerHTML = '';
    const shown = items.filter(({ c }) =>
      (group === '전체' || c.group === group) &&
      (!query || (c.name + c.area + c.group + c.addr).includes(query)));
    items.forEach(it => { const on = shown.includes(it); if (!it.marker) return; if (on) map.addLayer(it.marker); else map.removeLayer(it.marker); });
    shown.forEach(it => list.appendChild(it.card));
    if (!shown.length) { list.appendChild(empty); map.setView([36.4, 127.8], 7); return; }
    const pts = shown.filter(it => it.marker).map(({ c }) => [c.lat, c.lng]);
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [48, 48], maxZoom: 13 }); else map.setView([36.4, 127.8], 7);
    if (!shown.includes(items[active])) { if (active > -1) { items[active].card.classList.remove('is-active'); items[active].marker?.setIcon(icon(false)); } active = -1; }
  }

  document.querySelectorAll('.clinic-filter [data-chips] .chip').forEach(chip => chip.addEventListener('click', e => {
    e.preventDefault();
    group = chip.textContent.trim();
    apply();
  }));
  const form = document.querySelector('.clinic-filter .search');
  const input = form?.querySelector('input');
  form?.addEventListener('submit', e => { e.preventDefault(); query = input.value.trim(); apply(); });
  input?.addEventListener('input', () => { query = input.value.trim(); apply(); });

  apply();
  // Leaflet needs a size refresh once the layout (and reveal animations) settle
  window.addEventListener('load', () => map.invalidateSize());
  window.addEventListener('resize', () => map.invalidateSize());
})();
