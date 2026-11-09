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
      const lbl = document.createElement('span');
      lbl.className = 'dot-label';
      lbl.textContent = label;
      dot.appendChild(lbl);
      dot.addEventListener('click', () => {
        document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
      });
      nav.appendChild(dot);
      return { id, dot };
    });
    document.body.appendChild(nav);

    return () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.4;
      let activeId = sections[0][0];
      for (const [id] of sections) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          activeId = id;
        }
      }
      dots.forEach(({ id, dot }) => {
        dot.classList.toggle('active', id === activeId);
      });
    };
  }

  // ---------- Back to top button ----------
  function backToTop() {
    const btn = document.createElement('button');
    btn.className = 'hud-btn back-to-top';
    btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    btn.title = 'Back to top';
    btn.setAttribute('aria-label', 'Back to top');
    document.querySelector('.floating-action-hud').appendChild(btn);

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    return () => {
      btn.classList.toggle('show', window.scrollY > 500);
    };
  }

  // ---------- Side-switch colour sweep animation ----------
  function sideWipe(e) {
    if (reduceMotion) return;
    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY : window.innerHeight / 2;
    const maxR = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const wipe = document.createElement('div');
    wipe.className = 'side-wipe';
    wipe.style.left = `${x}px`;
    wipe.style.top = `${y}px`;
    wipe.style.background = isGroom() ? '#2a1236' : '#8b0000';
    document.body.appendChild(wipe);

    wipe.animate([
      { transform: 'scale(0)', opacity: 0.9 },
      { transform: `scale(${maxR / 20})`, opacity: 0.95 },
      { transform: `scale(${maxR / 15})`, opacity: 0 }
    ], {
      duration: 700,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
    }).onfinish = () => wipe.remove();
  }

  // ---------- Story timeline observer & progress ----------
  function initStoryTimeline() {
    const timeline = document.querySelector('.story-timeline');
    if (!timeline) return;

    const chapters = timeline.querySelectorAll('.story-chapter');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('lit');
        }
      });
    }, { threshold: 0.3 });

    chapters.forEach(c => observer.observe(c));

    window.addEventListener('scroll', () => {
      const rect = timeline.getBoundingClientRect();
      const windowH = window.innerHeight;
      const totalH = rect.height;
      const scrolled = windowH - rect.top;
      let progress = Math.max(0, Math.min(1, scrolled / (totalH + windowH * 0.2)));
      timeline.style.setProperty('--tl-progress', progress);
    }, { passive: true });
  }

  // ---------- Section headings entrance polish ----------
  function initHeadingsEntrance() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('drawn');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll('.section-eyebrow, .story-divider').forEach(el => {
      el.classList.add('pre-draw');
      observer.observe(el);
    });
  }

  // ---------- Card tilt & sheen effect ----------
  function initCardTilt() {
    if (!finePointer || reduceMotion) return;
    const card = document.getElementById('weddingCardMain');
    if (!card) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      const dx = (x - xc) / xc;
      const dy = (y - yc) / yc;

      card.style.transform = `perspective(1000px) rotateY(${dx * 3}deg) rotateX(${-dy * 3}deg) translateY(-4px)`;
      card.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--my', `${(y / rect.height) * 100}%`);
      card.classList.add('tilting');
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0)';
      card.classList.remove('tilting');
    });
  }

  // ---------- Handwritten text reveal on scroll ----------
  function initInkReveal() {
    const card = document.getElementById('weddingInviteCard');
    if (!card) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          card.classList.add('inked');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    card.classList.add('ink-ready');
    observer.observe(card);
  }

  // ---------- Event card staggered scroll reveal ----------
  function initEventCardReveal() {
    const cards = document.querySelectorAll('.professional-event-card');
    if (!cards.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, idx * 100);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    cards.forEach(c => observer.observe(c));
  }

  // ---------- Ambient magical sparkles ----------
  function initAmbientSparkles() {
    if (reduceMotion) return;
    setInterval(() => {
      const spark = document.createElement('div');
      spark.className = 'festive-sparkle';
      spark.style.left = `${Math.random() * window.innerWidth}px`;
      spark.style.bottom = `-20px`;
      spark.style.animationDuration = `${4 + Math.random() * 3}s`;
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 6000);
    }, 600);
  }

  // ---------- Click ripple animation ----------
  function initClickRipple() {
    if (reduceMotion) return;
    document.addEventListener('click', (e) => {
      const ripple = document.createElement('div');
      ripple.className = 'click-ripple';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  }

  // ---------- Interactive Drag-and-Apply Haldi feature ----------
  function initDragAndApplyHaldi() {
    const bowl = document.getElementById('haldiBowl');
    const target = document.getElementById('haldiTarget');
    if (!bowl || !target) return;

    const card = target.closest('.professional-event-card');
    if (card) card.style.position = 'relative';

    bowl.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', 'haldi');
    });

    target.addEventListener('dragover', (e) => {
      e.preventDefault();
      target.style.transform = 'scale(1.12)';
    });

    target.addEventListener('dragleave', () => {
      target.style.transform = 'scale(1)';
    });

    target.addEventListener('drop', (e) => {
      e.preventDefault();
      target.style.transform = 'scale(1)';
      triggerHaldiApplication(target, card);
    });

    target.addEventListener('click', () => {
      triggerHaldiApplication(target, card);
    });
  }

  function triggerHaldiApplication(targetEl, cardEl) {
    // Play chime sound
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1318.5, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    } catch(err) {}

    // Add turmeric splash overlay
    if (!targetEl.querySelector('.haldi-splash-overlay')) {
      const splash = document.createElement('div');
      splash.className = 'haldi-splash-overlay';
      splash.innerHTML = '💛';
      targetEl.appendChild(splash);
    }

    // Show badge on card
    if (cardEl && !cardEl.querySelector('.haldi-splash-badge')) {
      const badge = document.createElement('div');
      badge.className = 'haldi-splash-badge';
      badge.innerHTML = '✨ Haldi Applied Successfully! 💛';
      cardEl.appendChild(badge);
      setTimeout(() => badge.remove(), 4000);
    }

    // Turmeric dust particle burst
    const rect = targetEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'turmeric-dust';
      p.style.left = `${cx}px`;
      p.style.top = `${cy}px`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 4000);
    }
  }

  // ---------- Scroll-triggered Haldi powder drift ----------
  function initHaldiPowderDrift() {
    const section3 = document.getElementById('section3');
    if (!section3 || reduceMotion) return;

    let emitting = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        emitting = entry.isIntersecting;
      });
    }, { threshold: 0.1 });

    observer.observe(section3);

    setInterval(() => {
      if (!emitting) return;
      const rect = section3.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const dust = document.createElement('div');
        dust.className = 'turmeric-dust';
        dust.style.left = `${Math.random() * window.innerWidth}px`;
        dust.style.top = `${window.scrollY + window.innerHeight * (0.3 + Math.random() * 0.6)}px`;
        document.body.appendChild(dust);
        setTimeout(() => dust.remove(), 4500);
      }
    }, 900);
  }

  // ---------- Init all enhancements on DOM ready ----------
  document.addEventListener('DOMContentLoaded', () => {
    const onScrollProgress = scrollProgress();
    const onSectionDots = sectionDots();
    const onBackToTop = backToTop();

    window.addEventListener('scroll', () => {
      onScrollProgress();
      onSectionDots();
      onBackToTop();
    }, { passive: true });

    initStoryTimeline();
    initHeadingsEntrance();
    initCardTilt();
    initInkReveal();
    initEventCardReveal();
    initAmbientSparkles();
    initClickRipple();
    initDragAndApplyHaldi();
    initHaldiPowderDrift();

    const familyToggle = document.getElementById('familySliderToggle');
    if (familyToggle) {
      familyToggle.addEventListener('click', (e) => {
        sideWipe(e);
      });
    }
  });
})();

// Venue block click handler
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.event-venue').forEach(venue => {
    venue.style.cursor = 'pointer';
    venue.addEventListener('click', (e) => {
      const link = venue.querySelector('.venue-link');
      if (link && e.target !== link) {
        window.open(link.href, '_blank', 'noopener,noreferrer');
      }
    });
  });
});
