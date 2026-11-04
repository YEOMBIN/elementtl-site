/* 엘레멘트티엘 — 섹션별 인터랙션 (Hero · Hotspot · 3파장 · Scroll Storytelling)
   main.js 이후 로드. GSAP(ScrollTrigger)은 있으면 쓰고, 없으면 CSS 전환만으로 동작합니다. */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pc = () => window.matchMedia('(min-width: 1025px)').matches;
  document.documentElement.classList.add('has-motion');

  /* ---------- Hero: cinematic entrance + short scroll transition ---------- */
  const hero = document.querySelector('.hero');
  if (hero) {
    const ready = () => hero.classList.add('is-ready');
    requestAnimationFrame(() => requestAnimationFrame(ready));
    setTimeout(ready, 120);
    if (!reduce && window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1025px)', () => {
        const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 };
        gsap.fromTo('.hero__img', { yPercent: 0 }, { yPercent: 10, ease: 'none', immediateRender: false, scrollTrigger: st });
        gsap.fromTo('.hero__copy', { y: 0, opacity: 1 }, { y: -90, opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { ...st, end: '65% top' } });
        gsap.fromTo('.hero__img', { filter: 'brightness(1)' }, { filter: 'brightness(0.55)', ease: 'none', immediateRender: false, scrollTrigger: st });
      });
    }
  }

  /* ---------- Product intro: hotspots with pointer line ---------- */
  const spots = [...document.querySelectorAll('.hs')];
  if (spots.length) {
    const open = (key, pin = false) => spots.forEach(s => {
      const on = s.dataset.hs === key;
      s.classList.toggle('is-open', on);
      s.classList.toggle('is-pinned', on && pin);
      s.setAttribute('aria-expanded', on);
    });
    const close = () => spots.forEach(s => { if (!s.classList.contains('is-pinned')) { s.classList.remove('is-open'); s.setAttribute('aria-expanded', false); } });
    spots.forEach(s => {
      s.addEventListener('mouseenter', () => open(s.dataset.hs));
      s.addEventListener('mouseleave', close);
      s.addEventListener('focus', () => open(s.dataset.hs));
      s.addEventListener('click', () => (s.classList.contains('is-pinned') ? (s.classList.remove('is-pinned', 'is-open')) : open(s.dataset.hs, true)));
    });
    document.querySelectorAll('[data-hs-link]').forEach(st => {
      st.addEventListener('mouseenter', () => open(st.dataset.hsLink));
      st.addEventListener('mouseleave', close);
    });
    // First hotspot opens once the image is revealed, so the feature is discoverable
    const box = document.querySelector('.intro__img');
    if (box && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { setTimeout(() => { if (!spots.some(s => s.classList.contains('is-open'))) open('body'); }, 1400); io.disconnect(); }
      }), { threshold: 0.5 });
      io.observe(box);
    }
  }

  /* ---------- 3 wavelengths: the graph itself selects ---------- */
  document.querySelectorAll('.beam-l').forEach(g => {
    g.setAttribute('role', 'button');
    g.setAttribute('tabindex', '0');
    g.setAttribute('aria-label', g.dataset.w + 'nm 선택');
    const pick = () => document.querySelector(`.w-tab[data-w="${g.dataset.w}"]`)?.click();
    g.addEventListener('click', pick);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  });

  /* ---------- Clinical cards: stacking (PC) — sticky position, scrubbed dimming (both directions) ---------- */
  const caseWrap = document.querySelector('.cases');
  if (caseWrap && !reduce && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add('(min-width: 1025px)', () => {
      const kill = () => ScrollTrigger.getAll().filter(t => t.vars.id === 'case-stack').forEach(t => t.kill());
      const build = () => {
        kill();
        const cards = [...caseWrap.querySelectorAll('.case')].filter(c => c.offsetParent !== null);
        cards.forEach((c, i) => {
          c.style.setProperty('--stack-top', 120 + i * 18 + 'px');
          c.style.zIndex = i + 1;
          c.style.setProperty('--dim', 0);
          const next = cards[i + 1];
          if (!next) return;
          gsap.fromTo(c, { '--dim': 0 }, { '--dim': 1, ease: 'none', immediateRender: false,
            scrollTrigger: { id: 'case-stack', trigger: next, start: 'top 85%', end: 'top ' + (120 + (i + 1) * 18) + 'px', scrub: 0.6 } });
        });
      };
      caseWrap.classList.add('is-stack');
      build();
      const onTab = () => setTimeout(() => { build(); ScrollTrigger.refresh(); }, 60);
      const tabs = [...document.querySelectorAll('.ftab')];
      tabs.forEach(b => b.addEventListener('click', onTab));
      return () => { tabs.forEach(b => b.removeEventListener('click', onTab)); caseWrap.classList.remove('is-stack'); kill(); caseWrap.querySelectorAll('.case').forEach(c => { c.style.zIndex = ''; c.style.removeProperty('--dim'); }); };
    });
  }
})();
