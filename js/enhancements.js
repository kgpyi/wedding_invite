// Enhancements: scroll progress, section dots, side-switch sweep,
// timeline progress, handwritten names, card tilt, hero depth and small UX fixes
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const isGroom = () => document.body.getAttribute('data-family') === 'groom';

  // ---------- Scroll progress bar ----------
  function scrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.innerHTML = '<span></span>';
    document.body.appendChild(bar);
    const fill = bar.firstChild;
    return () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      fill.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
  }

  // ---------- Section dots ----------
  function sectionDots() {
    const sections = [
      ['section1', 'Welcome'],
      ['invitationSection', 'Invitation'],
      ['section2', 'Our Story'],
      ['section3', 'Celebrations']
    ].filter(([id]) => document.getElementById(id));

    const nav = document.createElement('nav');
    nav.className = 'section-dots';
    nav.setAttribute('aria-label', 'Page sections');
    const dots = sections.map(([id, label]) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'section-dot';
      dot.setAttribute('aria-label', label);
      dot.innerHTML = `<span class="dot-label">${label}</span>`;
      dot.addEventListener('click', () => {
        document.getElementById(id).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      });
      nav.appendChild(dot);
      return dot;
    });
    document.body.appendChild(nav);

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const i = sections.findIndex(([id]) => id === entry.target.id);
        dots.forEach((d, j) => d.classList.toggle('active', i === j));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(([id]) => io.observe(document.getElementById(id)));
  }

  // ---------- Back to top ----------
  function backToTop() {
    const hud = document.querySelector('.floating-action-hud');
    if (!hud) return () => {};
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hud-btn back-to-top';
    btn.title = 'Back to top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
    hud.insertBefore(btn, hud.firstChild);
    return () => btn.classList.toggle('show', window.scrollY > window.innerHeight * 0.8);
  }

  // ---------- Side switch: colour sweep and browser bar colour ----------
  function sideSwitch() {
    const meta = document.querySelector('meta[name="theme-color"]');
    const syncThemeColor = () => {
      if (meta) meta.setAttribute('content', getComputedStyle(document.body).getPropertyValue('--dark').trim());
    };
    syncThemeColor();

    const toggle = document.getElementById('familySliderToggle');
    if (!toggle) return;
    toggle.addEventListener('click', (e) => {
      syncThemeColor();
      const names = document.getElementById('weddingNamesContainer');
      if (names && names.classList.contains('inked') && !reduceMotion) {
        // re-write the swapped names
        names.classList.remove('inked');
        void names.offsetWidth;
        names.classList.add('inked');
      }
      if (reduceMotion) return;
      const wipe = document.createElement('div');
      wipe.className = 'side-wipe';
      wipe.style.left = e.clientX + 'px';
      wipe.style.top = e.clientY + 'px';
      wipe.style.background = getComputedStyle(document.body).getPropertyValue('--vibe-accent');
      document.body.appendChild(wipe);
      const reach = Math.hypot(Math.max(e.clientX, window.innerWidth - e.clientX), Math.max(e.clientY, window.innerHeight - e.clientY));
      const anim = wipe.animate([
        { transform: 'scale(0)', opacity: 0.35 },
        { transform: `scale(${(reach * 2) / 40})`, opacity: 0 }
      ], { duration: 900, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
      anim.onfinish = () => wipe.remove();
    });
  }

  // ---------- Story timeline fills as you read ----------
  function timelineProgress() {
    const timeline = document.querySelector('.story-timeline');
    if (!timeline) return () => {};
    const chapters = [...timeline.querySelectorAll('.story-chapter')];
    return () => {
      const rect = timeline.getBoundingClientRect();
      const line = window.innerHeight * 0.65;
      const progress = Math.min(1, Math.max(0, (line - rect.top) / rect.height));
      timeline.style.setProperty('--tl-progress', progress.toFixed(3));
      chapters.forEach((ch) => {
        const icon = ch.querySelector('.chapter-icon').getBoundingClientRect();
        ch.classList.toggle('lit', icon.top + icon.height / 2 < line);
      });
    };
  }

  // ---------- Hero depth as you scroll away ----------
  function heroDepth() {
    const content = document.querySelector('.hero-container .content-overlay');
    const video = document.querySelector('.hero-container .background-video');
    if (!content || reduceMotion) return () => {};
    return () => {
      const y = window.scrollY;
      const h = window.innerHeight;
      if (y > h) return;
      content.style.transform = `translateY(${y * 0.35}px)`;
      content.style.opacity = Math.max(0, 1 - y / (h * 0.75)).toFixed(3);
      if (video) video.style.transform = `scale(${1 + (y / h) * 0.08})`;
    };
  }

  // ---------- Headings draw in ----------
  function headingDraw() {
    const targets = document.querySelectorAll('.section-eyebrow, .story-divider');
    targets.forEach((el) => el.classList.add('pre-draw'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('drawn');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    targets.forEach((el) => io.observe(el));
  }

  // ---------- Invitation card: handwritten names and gentle tilt ----------
  function invitationCard() {
    const names = document.getElementById('weddingNamesContainer');
    const card = document.getElementById('weddingCardMain');
    if (names) {
      names.classList.add('ink-ready');
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          names.classList.add('inked');
          io.disconnect();
        }
      }, { threshold: 0.4 });
      io.observe(names);
    }
    if (!card || reduceMotion || !finePointer) return;
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(1400px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 5}deg)`;
      card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      card.classList.add('tilting');
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.classList.remove('tilting');
    });
  }

  // ---------- Wishes modal: close on backdrop click or Escape ----------
  function wishesModal() {
    const overlay = document.getElementById('wishesModalOverlay');
    if (!overlay) return;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.add('hidden');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') overlay.classList.add('hidden');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    sectionDots();
    sideSwitch();
    headingDraw();
    invitationCard();
    wishesModal();

    const onScroll = [scrollProgress(), backToTop(), timelineProgress(), heroDepth()];
    let ticking = false;
    const update = () => {
      ticking = false;
      onScroll.forEach((fn) => fn());
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();
