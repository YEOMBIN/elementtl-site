/* 도입 병원 찾기 — 병원 목록 · 지도(Leaflet + OpenStreetMap) · 지역 필터 · 검색 */
(function () {
  /* 병원 목록 (2026-11 전달 자료). 좌표는 전달받은 지역 기준의 대략 위치이며, 정확한 주소 확정 후 교체합니다.
     group: 지역 필터 칩 이름 / area: 카드에 표시할 지역 */
  const CLINICS = [
    { name: '연세코스모의원', group: '경기', area: '광명', lat: 37.4786, lng: 126.8646 },
    { name: '리앤샤인의원', group: '경기', area: '평택', lat: 36.9921, lng: 127.0857 },
    { name: '목동제이의원', group: '서울', area: '목동', lat: 37.5290, lng: 126.8705 },
    { name: '미셀의원', group: '서울', area: '목동', lat: 37.5248, lng: 126.8780 },
    { name: '닥터에버스의원', group: '경기', area: '일산', lat: 37.6584, lng: 126.7700 },
    { name: '이소진의원', group: '서울', area: '강북', lat: 37.6396, lng: 127.0257 },
    { name: '타임피부과', group: '대전', area: '대전', lat: 36.3504, lng: 127.3845 },
    { name: '연세피움의원', group: '울산', area: '울산', lat: 35.5384, lng: 129.3114 },
    { name: '소사벌다시봄날의원', group: '경기', area: '평택', lat: 37.0010, lng: 127.1080 },
    { name: '엑셀브이의원', group: '서울', area: '송파', lat: 37.5145, lng: 127.1059 },
    { name: '탑라인의원', group: '경기', area: '성남', lat: 37.4200, lng: 127.1267 },
    { name: '닥터킨베인의원', group: '인천', area: '인천', lat: 37.4563, lng: 126.7052 },
  ];

  const list = document.querySelector('.clinic-list');
  const mapBox = document.getElementById('clinic-map');
  if (!list || !mapBox || typeof L === 'undefined') return;

  const PIN = on => `<svg viewBox="0 0 16 16" width="30" height="30"><path d="M8 15s5-4.6 5-8.5A5 5 0 003 6.5C3 10.4 8 15 8 15z" fill="${on ? '#2f6bff' : '#142443'}"/><circle cx="8" cy="6.5" r="1.8" fill="#fff"/></svg>`;
  const icon = on => L.divIcon({ className: 'clinic-pin' + (on ? ' is-on' : ''), html: PIN(on), iconSize: [30, 30], iconAnchor: [15, 28], popupAnchor: [0, -26] });
  const route = name => 'https://map.naver.com/p/search/' + encodeURIComponent(name);

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
      <p><span>주소 [확정 후 입력]</span><span>전화 [확정 후 입력]</span></p>
      <div class="acts"><a href="${route(c.name)}" target="_blank" rel="noopener">길찾기</a><a href="#" data-todo="병원 블로그 주소는 병원 확인 후 연결됩니다.">병원 블로그</a></div>`;
    const marker = L.marker([c.lat, c.lng], { icon: icon(false), title: c.name, riseOnHover: true })
      .bindPopup(`<b>${c.name}</b><span>${c.group === c.area ? c.area : c.group + ' ' + c.area}</span>`, { closeButton: false, offset: [0, 0] })
      .addTo(map);
    marker.on('click', () => select(i, { scrollCard: true }));
    card.addEventListener('click', e => { if (!e.target.closest('a')) select(i, { fly: true }); });
    card.addEventListener('keydown', e => { if (e.key === 'Enter') select(i, { fly: true }); });
    return { c, card, marker };
  });

  const empty = document.createElement('p');
  empty.className = 'clinic-empty';
  empty.textContent = '해당 조건의 도입 병원 정보가 아직 없습니다.';

  function select(i, { fly = false, scrollCard = false } = {}) {
    if (active > -1) { items[active].card.classList.remove('is-active'); items[active].marker.setIcon(icon(false)); }
    active = i;
    const it = items[i];
    it.card.classList.add('is-active');
    it.marker.setIcon(icon(true));
    it.marker.setZIndexOffset(1000);
    if (fly) map.flyTo([it.c.lat, it.c.lng], Math.max(map.getZoom(), 12), { duration: 0.8 });
    it.marker.openPopup();
    if (scrollCard) it.card.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }

  let group = '전체', query = '';
  function apply() {
    list.innerHTML = '';
    const shown = items.filter(({ c }) =>
      (group === '전체' || c.group === group) &&
      (!query || (c.name + c.area + c.group).includes(query)));
    items.forEach(it => { const on = shown.includes(it); if (on) map.addLayer(it.marker); else map.removeLayer(it.marker); });
    shown.forEach(it => list.appendChild(it.card));
    if (!shown.length) { list.appendChild(empty); map.setView([36.4, 127.8], 7); return; }
    const bounds = L.latLngBounds(shown.map(({ c }) => [c.lat, c.lng]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
    if (!shown.includes(items[active])) { if (active > -1) { items[active].card.classList.remove('is-active'); items[active].marker.setIcon(icon(false)); } active = -1; }
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
