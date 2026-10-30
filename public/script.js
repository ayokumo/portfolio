// ==========================================================================
// Ayokunmi Lawal — Portfolio Scripts
// Fusion: Editorial Running Folio + Git Graph Scroll Timeline & j/k navigation
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fallback = !reduce && !CSS.supports('animation-timeline', 'view()');
  const TIP = 0.65; // line tip triggers at 65% of screen height
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  if (fallback) {
    document.documentElement.classList.add('js-graph');
  }

  const sections = [...document.querySelectorAll('.commit')];
  const pieces = [...document.querySelectorAll('.piece')];
  const dots = [...document.querySelectorAll('.dot')];
  const navLinks = [...document.querySelectorAll('.folio-nav a')];
  const folioNow = document.querySelector('.folio-now');

  // Allow j/k to focus headings without a tab order disruption
  sections.forEach((s) => {
    const heading = s.querySelector('.commit-title');
    if (heading) heading.setAttribute('tabindex', '-1');
  });

  let headIndex = -1;
  let queued = false;
  let jumped = -1;
  let jumpSeen = false;

  function setHead(index) {
    headIndex = index;
    const currentSection = sections[index];
    if (!currentSection) return;

    const id = currentSection.id;

    // Update navigation active state
    let label = '';
    navLinks.forEach((link) => {
      if (link.hash === '#' + id) {
        link.setAttribute('aria-current', 'location');
        label = link.textContent.trim();
      } else {
        link.removeAttribute('aria-current');
      }
    });

    // Update Editorial header display
    if (folioNow && label) {
      const nextSpan = document.createElement('span');
      nextSpan.textContent = label;
      folioNow.replaceChildren(nextSpan);
    }

    // Update active HEAD ring on the Git commit dot
    sections.forEach((s, i) => {
      const dot = s.querySelector(':scope > .rail > .dot');
      if (dot) {
        dot.classList.toggle('is-head', i === index);
      }
    });
  }

  function update() {
    queued = false;
    const vh = window.innerHeight;
    const tipY = vh * TIP;
    const atBottom = vh + window.scrollY >= document.documentElement.scrollHeight - 2;

    const topbar = document.querySelector('.folio');
    const readY = (topbar ? topbar.getBoundingClientRect().bottom : 60) + vh * 0.15;
    const tops = sections.map((s) => s.getBoundingClientRect().top);
    const jumpBox = jumped >= 0 && sections[jumped] ? sections[jumped].getBoundingClientRect() : null;
    const pieceBoxes = fallback ? pieces.map((p) => p.getBoundingClientRect()) : [];
    const dotBoxes = fallback ? dots.map((d) => d.getBoundingClientRect()) : [];

    let index = 0;
    tops.forEach((top, i) => {
      if (top <= readY) index = i;
    });

    if (atBottom) {
      index = sections.length - 1;
    }

    if (jumpBox) {
      if (jumpBox.bottom > 0 && jumpBox.top < vh) {
        jumpSeen = true;
      } else if (jumpSeen) {
        jumped = -1;
      }
    }

    if (jumped >= 0) {
      index = jumped;
    }

    if (index !== headIndex) {
      setHead(index);
    }

    // Scroll drawing fallback for older browsers
    if (fallback) {
      pieces.forEach((p, i) => {
        const box = pieceBoxes[i];
        if (!box) return;
        const progress = atBottom ? 1 : clamp((tipY - box.top) / box.height, 0, 1);
        p.style.setProperty('--draw', progress.toFixed(3));
      });

      dots.forEach((d, i) => {
        const box = dotBoxes[i];
        if (!box) return;
        const reached = atBottom || (box.top + box.height / 2 <= tipY);
        d.classList.toggle('is-reached', reached);
      });
    }
  }

  const request = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);

  // Jump click handler for nav links
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const idx = sections.findIndex((s) => '#' + s.id === link.hash);
      if (idx >= 0) {
        jumped = idx;
        jumpSeen = false;
        setHead(idx);
      }
    });
  });

  const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
  ['wheel', 'touchmove', 'pointerdown'].forEach((name) => {
    window.addEventListener(name, () => {
      jumped = -1;
    }, { passive: true });
  });

  // Keyboard navigation: j (next section), k (previous section)
  document.addEventListener('keydown', (event) => {
    if (scrollKeys.includes(event.key)) jumped = -1;
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key !== 'j' && event.key !== 'k') return;
    if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]')) return;

    const from = jumped >= 0 ? jumped : headIndex;
    const next = clamp(from + (event.key === 'j' ? 1 : -1), 0, sections.length - 1);
    if (next === from) return;

    jumped = next;
    jumpSeen = false;
    setHead(next);
    sections[next].scrollIntoView({ behavior: 'smooth' });

    const heading = sections[next].querySelector('.commit-title');
    if (heading) heading.focus({ preventScroll: true });
  });

  // Initial calculation
  request();
});
