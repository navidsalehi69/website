/* =========================================================
   NAVID SALEHZADEH — Interactions
   ========================================================= */

(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Preloader ---------- */
  const preloader = $('#preloader');
  const preCount = $('.preloader-count');
  const preFill = $('.preloader-bar i');

  const finishLoading = () => {
    document.documentElement.classList.add('is-loaded');
    document.body.classList.remove('is-locked');
    if (!preloader) return;
    preloader.classList.add('is-done');
    window.setTimeout(() => preloader.remove(), 1200);
  };

  if (reduceMotion || !preloader) {
    finishLoading();
  } else {
    document.body.classList.add('is-locked');
    let progress = 0;
    const step = () => {
      progress = Math.min(100, progress + Math.random() * 16 + 6);
      if (preCount) preCount.textContent = String(Math.round(progress)).padStart(2, '0');
      if (preFill) preFill.style.width = progress + '%';
      if (progress < 100) {
        window.setTimeout(step, 60);
      } else {
        window.setTimeout(finishLoading, 260);
      }
    };
    window.setTimeout(step, 120);
    window.addEventListener('load', () => {
      if (progress < 100) progress = 92;
    });
    /* Safety net: never trap the page behind the curtain */
    window.setTimeout(() => {
      if (document.body.classList.contains('is-locked')) finishLoading();
    }, 4000);
  }

  /* ---------- Header ---------- */
  const header = $('#siteHeader');
  const onHeaderScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onHeaderScroll, { passive: true });
  onHeaderScroll();

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('#menuBtn');
  const mobileMenu = $('#mobileMenu');

  const closeMenu = () => {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('is-locked');
  };

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('is-open');
      menuBtn.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      mobileMenu.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('is-locked', open);
    });

    $$('a', mobileMenu).forEach(a => a.addEventListener('click', closeMenu));

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 980 && mobileMenu.classList.contains('is-open')) closeMenu();
    });
  }

  /* ---------- Nav active state ---------- */
  const navLinks = $$('.nav a[data-nav]');
  const trackedSections = ['about', 'works', 'expertise', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (navLinks.length && trackedSections.length) {
    let navTick = false;
    const syncNav = () => {
      navTick = false;
      const marker = window.scrollY + window.innerHeight * 0.42;
      let current = null;
      trackedSections.forEach(section => {
        if (section.offsetTop <= marker) current = section.id;
      });
      navLinks.forEach(link => {
        const active = current !== null && link.dataset.nav === current;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    };
    const requestNav = () => {
      if (!navTick) {
        navTick = true;
        requestAnimationFrame(syncNav);
      }
    };
    window.addEventListener('scroll', requestNav, { passive: true });
    window.addEventListener('resize', requestNav);
    syncNav();
  }

  /* ---------- Cursor ---------- */
  const cursor = $('#cursor');
  if (cursor && finePointer && !reduceMotion) {
    let tx = 0, ty = 0, cx = 0, cy = 0, active = false;

    window.addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      if (!active) {
        cursor.classList.add('is-active');
        active = true;
      }
      const hit = e.target.closest('a, button, .work, [data-cursor]');
      cursor.classList.toggle('is-hover', Boolean(hit));
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-active');
      active = false;
    });

    const loop = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Work covers fade in ---------- */
  $$('.work-media img').forEach(img => {
    if (img.complete) {
      img.classList.add('is-loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
    }
  });

  /* ---------- Filters ---------- */
  const filterButtons = $$('.filter');
  const worksGrid = $('#worksGrid');

  const visibleWorks = () =>
    worksGrid ? $$('.work:not(.is-hidden)', worksGrid) : [];

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterButtons.forEach(b => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });

      if (!worksGrid) return;
      let shown = 0;
      $$('.work', worksGrid).forEach(card => {
        const match = filter === 'all' || card.dataset.cat === filter;
        card.classList.toggle('is-hidden', !match);
        if (match && !reduceMotion) {
          card.animate(
            [
              { opacity: 0, transform: 'translateY(18px)' },
              { opacity: 1, transform: 'translateY(0)' }
            ],
            { duration: 620, delay: Math.min(shown, 7) * 55, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }
          );
        }
        if (match) shown++;
      });
    });
  });

  /* ---------- Lightbox ---------- */
  const lightbox = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbTitle = $('#lbTitle');
  const lbType = $('#lbType');
  const lbCount = $('#lbCount');
  const lbClose = $('#lbClose');
  const lbPrev = $('#lbPrev');
  const lbNext = $('#lbNext');

  let lbList = [];
  let lbIndex = 0;
  let lastFocused = null;

  const renderSlide = () => {
    const card = lbList[lbIndex];
    if (!card) return;
    const img = $('img', card);
    const title = card.dataset.title || '';
    const type = card.dataset.type || '';
    lbImg.src = img ? img.getAttribute('src') : '';
    lbImg.alt = img ? img.alt : title;
    if (lbTitle) lbTitle.innerHTML = title;
    if (lbType) lbType.textContent = type;
    if (lbCount) {
      lbCount.textContent = `${String(lbIndex + 1).padStart(2, '0')} / ${String(lbList.length).padStart(2, '0')}`;
    }
  };

  const openLightbox = card => {
    if (!lightbox) return;
    lbList = visibleWorks();
    lbIndex = lbList.indexOf(card);
    if (lbIndex < 0) lbIndex = 0;
    lastFocused = document.activeElement;
    renderSlide();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    lbClose?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
  };

  const stepSlide = dir => {
    if (!lbList.length) return;
    lbIndex = (lbIndex + dir + lbList.length) % lbList.length;
    renderSlide();
  };

  if (worksGrid && lightbox) {
    worksGrid.addEventListener('click', e => {
      const card = e.target.closest('.work');
      if (card) openLightbox(card);
    });
  }

  lbClose?.addEventListener('click', closeLightbox);
  lbPrev?.addEventListener('click', () => stepSlide(-1));
  lbNext?.addEventListener('click', () => stepSlide(1));

  lightbox?.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  window.addEventListener('keydown', e => {
    if (!lightbox?.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepSlide(-1);
    if (e.key === 'ArrowRight') stepSlide(1);
  });

  /* Touch swipe in lightbox */
  if (lightbox) {
    let touchX = 0;
    lightbox.addEventListener('touchstart', e => {
      touchX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 55) stepSlide(dx > 0 ? -1 : 1);
    }, { passive: true });
  }

  /* ---------- Parallax ---------- */
  const parallaxEls = $$('[data-parallax]');
  if (parallaxEls.length && !reduceMotion) {
    let ticking = false;

    const update = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -160 || rect.top > vh + 160) return;
        const center = rect.top + rect.height / 2 - vh / 2;
        const kind = el.dataset.parallax;
        let shift = 0;
        if (kind === 'hero') {
          if (finePointer) return;
          shift = Math.min(window.scrollY * 0.16, 120);
          el.style.transform = `translate3d(0, ${shift}px, 0)`;
          return;
        }
        const strength = -0.1;
        const limit = 40;
        shift = Math.max(-limit, Math.min(limit, center * strength));
        el.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
      });
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    if (finePointer) {
      window.addEventListener('scroll', requestTick, { passive: true });
      window.addEventListener('resize', requestTick);
      update();
    }
  }

  /* ---------- Hero pointer drift ---------- */
  const heroMedia = $('.hero-media');
  if (heroMedia && finePointer && !reduceMotion) {
    let hx = 0, hy = 0, hcx = 0, hcy = 0;
    window.addEventListener('mousemove', e => {
      hx = (e.clientX / window.innerWidth - 0.5) * 12;
      hy = (e.clientY / window.innerHeight - 0.5) * 12;
    }, { passive: true });
    const drift = () => {
      hcx += (hx - hcx) * 0.05;
      hcy += (hy - hcy) * 0.05;
      const base = Math.min(window.scrollY * 0.16, 120);
      heroMedia.style.transform = `translate3d(${hcx.toFixed(2)}px, ${(base + hcy).toFixed(2)}px, 0)`;
      requestAnimationFrame(drift);
    };
    drift();
  }

})();
