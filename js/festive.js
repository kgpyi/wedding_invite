// Festive layer: falling petals, confetti, sparkles, scroll reveals, toasts & shehnai-style music
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Each side gets its own confetti, always tied together by gold
  const CONFETTI_COLORS = {
    bride: ['#5b2c6f', '#8a5a9e', '#ece3f0', '#c9a227', '#f3d27a', '#ffffff'],
    groom: ['#1c5b4c', '#3f8a74', '#dcece6', '#c9a227', '#f3d27a', '#ffffff']
  };
  const currentSide = () => (document.body.getAttribute('data-family') === 'groom' ? 'groom' : 'bride');

  // ---------- Toast ----------
  let toastEl, toastTimer;
  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'festive-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    // force a reflow so the slide-in plays; a deferred rAF could fire after the hide timer in a background tab
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
  }

  // ---------- Confetti burst ----------
  function confetti(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 80) {
    if (reduceMotion) return;
    const shapes = currentSide() === 'groom' ? ['🍃', '✨'] : ['🌼', '✨'];
    const colors = CONFETTI_COLORS[currentSide()];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const useEmoji = Math.random() < 0.12;
      if (useEmoji) {
        piece.textContent = shapes[Math.floor(Math.random() * shapes.length)];
        piece.style.fontSize = 14 + Math.random() * 12 + 'px';
      } else {
        const size = 6 + Math.random() * 8;
        piece.style.width = size + 'px';
        piece.style.height = size * (Math.random() < 0.5 ? 0.45 : 1) + 'px';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.borderRadius = Math.random() < 0.4 ? '50%' : '2px';
      }
      piece.style.left = x + 'px';
      piece.style.top = y + 'px';
      document.body.appendChild(piece);

      const angle = Math.random() * Math.PI * 2;
      const velocity = 120 + Math.random() * 280;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity - 180;
      const spin = (Math.random() - 0.5) * 1080;
      const anim = piece.animate([
        { transform: 'translate(-50%, -50%) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${spin / 2}deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(calc(-50% + ${dx * 1.3}px), calc(-50% + ${dy + 420}px)) rotate(${spin}deg)`, opacity: 0 }
      ], { duration: 1600 + Math.random() * 1000, easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)' });
      anim.onfinish = () => piece.remove();
    }
  }

  window.festive = { toast, confetti };

  // ---------- Falling petals canvas ----------
  function startPetals() {
    if (reduceMotion) return;
    const canvas = document.createElement('canvas');
    canvas.id = 'petalCanvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const palettes = {
      // lilac, jasmine and gold petals for Nikita; marigold, jasmine and leaf green for Khushal
      bride: ['#b892c9', '#e6d4ee', '#fffaf0', '#f3d27a'],
      groom: ['#f6c453', '#fffaf0', '#f3d27a', '#7fb59f']
    };
    let width, height, petals = [];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const petalCount = window.innerWidth < 768 ? 7 : 14;
    function makePetal(initial) {
      const side = currentSide();
      const colors = palettes[side];
      return {
        x: Math.random() * width,
        y: initial ? Math.random() * height : -20,
        size: 7 + Math.random() * 9,
        speed: 0.5 + Math.random() * 1.1,
        drift: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.04,
        color: colors[Math.floor(Math.random() * colors.length)],
        marigold: Math.random() < (side === 'groom' ? 0.5 : 0.25)
      };
    }
    for (let i = 0; i < petalCount; i++) petals.push(makePetal(true));

    // Recolour the petals already falling as soon as the side changes
    new MutationObserver(() => {
      petals = petals.map((p) => {
        const fresh = makePetal(true);
        return { ...p, color: fresh.color, marigold: fresh.marigold };
      });
    }).observe(document.body, { attributes: true, attributeFilter: ['data-family'] });

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = p.color;
      if (p.marigold) {
        // little round marigold bloom
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(200, 90, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.22, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // teardrop rose petal
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.9, -p.size * 0.6, p.size * 0.6, p.size * 0.6, 0, p.size * 0.8);
        ctx.bezierCurveTo(-p.size * 0.6, p.size * 0.6, -p.size * 0.9, -p.size * 0.6, 0, -p.size);
        ctx.fill();
      }
      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, width, height);
      petals.forEach((p, i) => {
        p.drift += 0.012;
        p.y += p.speed;
        p.x += Math.sin(p.drift) * 0.7;
        p.rotation += p.spin;
        if (p.y > height + 20) petals[i] = makePetal(false);
        drawPetal(p);
      });
      requestAnimationFrame(tick);
    }
    tick();
  }

  // ---------- Sparkle cursor trail ----------
  function sparkleTrail() {
    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;
    let last = 0;
    const glyphs = ['✨', '✦', '❤', '✧'];
    document.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - last < 90) return;
      last = now;
      const s = document.createElement('span');
      s.className = 'sparkle';
      s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      s.style.left = e.clientX + 'px';
      s.style.top = e.clientY + 'px';
      s.style.color = Math.random() < 0.5 ? '#ffd700' : 'var(--vibe-accent)';
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 900);
    });
  }

  // ---------- Scroll reveals ----------
  function scrollReveals() {
    const targets = document.querySelectorAll(
      '.story-arch, .story-quote-badge, .story-chapter, .story-banner, .professional-event-card, .section-3 .row.text-center, .group-head'
    );
    targets.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', (i % 4) * 0.12 + 's');
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach((el) => io.observe(el));
  }

  // ---------- Countdown tick pop (every unit pops when it changes) ----------
  function countdownPop() {
    ['days', 'hours', 'minutes', 'seconds'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      new MutationObserver(() => {
        el.classList.remove('tick');
        void el.offsetWidth;
        el.classList.add('tick');
      }).observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  // ---------- Invitation card corners & confetti on first reveal ----------
  function decorateCard() {
    const card = document.getElementById('weddingCardMain');
    if (!card) return;
    ['tl', 'tr', 'bl', 'br'].forEach((pos) => {
      const c = document.createElement('span');
      c.className = 'card-corner ' + pos;
      c.textContent = '❁';
      card.appendChild(c);
    });
    let celebrated = false;
    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting && !celebrated) {
        celebrated = true;
        const r = card.getBoundingClientRect();
        confetti(r.left + r.width / 2, r.top + 80, 50);
        obs.disconnect();
      }
    }, { threshold: 0.5 }).observe(card);
  }

  // ---------- Family toggle: celebratory burst ----------
  function toggleBurst() {
    const t = document.getElementById('familySliderToggle');
    if (!t) return;
    t.addEventListener('click', (e) => {
      confetti(e.clientX, e.clientY + 20, 22);
      const side = document.body.getAttribute('data-family');
      toast(side === 'groom' ? '👑 Welcome, Khushal\'s family!' : '🌼 Welcome, Nikita\'s family!');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    startPetals();
    sparkleTrail();
    scrollReveals();
    countdownPop();
    decorateCard();
    toggleBurst();
  });
})();
