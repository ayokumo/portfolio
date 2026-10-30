// ==========================================================================
// Ayokunmi Lawal — Portfolio Scripts
// Fusion: Running Folio Navigation + Swiss Minimal Digit Counters & Reveals
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------------
  // 1. Section Numbers: Rolling counter digit strips
  // ------------------------------------------------------------------------
  document.querySelectorAll('.sec-num').forEach((num) => {
    const text = num.textContent.trim();
    num.textContent = '';
    [...text].forEach((ch) => {
      if (!/\d/.test(ch)) {
        num.append(ch);
        return;
      }
      const to = Number(ch);
      const digit = document.createElement('span');
      digit.className = 'digit';
      digit.style.setProperty('--to', to);

      const strip = document.createElement('span');
      strip.className = 'digit-strip';
      for (let n = 0; n <= to; n += 1) {
        const cell = document.createElement('span');
        cell.textContent = String(n);
        strip.append(cell);
      }
      digit.append(strip);
      num.append(digit);
    });
  });

  // ------------------------------------------------------------------------
  // 2. Scroll Reveals: Column-step arrival
  // ------------------------------------------------------------------------
  const sections = [...document.querySelectorAll('main .section')];
  const atBottom = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

  function reveal(section) {
    section.classList.add('is-in');
  }

  if ('IntersectionObserver' in window) {
    const revealer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          reveal(entry.target);
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px' });

    sections.forEach((section) => {
      section.classList.add('will-reveal');
      const title = section.querySelector('.sec-title');
      if (title) title.style.setProperty('--i', '0');

      section.querySelectorAll('.sec-body > :not(ul), .sec-body > ul > li, .skill-group').forEach((el, i) => {
        el.classList.add('reveal-item');
        el.style.setProperty('--i', String(i + 1));
      });
      revealer.observe(section);
    });
  }

  // Focus-in reveal for keyboard accessibility
  document.addEventListener('focusin', (event) => {
    const section = event.target.closest('.will-reveal');
    if (section) reveal(section);
  });

  // ------------------------------------------------------------------------
  // 3. Editorial Running Folio Navigation
  // ------------------------------------------------------------------------
  const allSections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.folio-nav a')];
  const folioNow = document.querySelector('.folio-now');
  let currentId = allSections.length ? allSections[0].id : '';
  let lockedId = '';
  let lockSeen = false;
  let ticking = false;

  function setCurrent(id) {
    currentId = id;
    let label = '';
    navLinks.forEach((link) => {
      if (link.hash === '#' + id) {
        link.setAttribute('aria-current', 'location');
        label = link.textContent.trim();
      } else {
        link.removeAttribute('aria-current');
      }
    });

    if (folioNow && label) {
      const nextSpan = document.createElement('span');
      nextSpan.textContent = label;
      folioNow.replaceChildren(nextSpan);
    }
  }

  function spy() {
    if (!allSections.length) return;
    const probe = window.innerHeight * 0.35;
    const rects = allSections.map((s) => s.getBoundingClientRect());
    let id = allSections[0].id;

    rects.forEach((rect, i) => {
      if (rect.top <= probe) id = allSections[i].id;
    });

    if (window.scrollY < 8) {
      id = allSections[0].id;
    } else if (atBottom()) {
      id = allSections[allSections.length - 1].id;
      sections.forEach(reveal);
    }

    const lockIndex = allSections.findIndex((s) => s.id === lockedId);
    if (lockIndex >= 0) {
      const r = rects[lockIndex];
      const onScreen = r.bottom > 0 && r.top < window.innerHeight;
      if (onScreen) lockSeen = true;
      if (onScreen || !lockSeen) id = lockedId;
      else lockedId = '';
    }

    if (id !== currentId) setCurrent(id);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      spy();
    });
  }

  function lockTo(hash) {
    const id = hash.replace('#', '');
    if (!allSections.some((s) => s.id === id)) return;
    lockedId = id;
    lockSeen = false;
    const target = document.getElementById(id);
    if (target && target.classList.contains('will-reveal')) {
      reveal(target);
    }
    setCurrent(id);
  }

  function unlock() {
    lockedId = '';
    onScroll();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('hashchange', () => lockTo(location.hash));
  navLinks.forEach((link) => link.addEventListener('click', () => lockTo(link.hash)));

  ['wheel', 'touchmove'].forEach((type) => window.addEventListener(type, unlock, { passive: true }));
  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
      unlock();
    }
  });

  if (location.hash) lockTo(location.hash);
  spy();
});
