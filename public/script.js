// ==========================================================================
// Ayokunmi Lawal — Portfolio Scripts
// Vibe: Swiss Minimal Interactions (Digit Counters, Slide Reveal, Nav Spy)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Signature: Build rolling counter digit strips for section numbers
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

  // 2. Scroll: Column-step reveals
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

  // 3. Navigation: Red indicator underline & Section Spying
  const links = [...document.querySelectorAll('.site-header a[href^="#"]')];
  const spied = [...document.querySelectorAll('main > section[id]')];
  let pinned = null;
  let queued = false;

  function setCurrent(id) {
    links.forEach((a) => {
      if (a.hash === '#' + id) {
        a.setAttribute('aria-current', 'location');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  function pin(id) {
    const target = document.getElementById(id);
    if (!target) return;
    pinned = id;
    if (target.classList.contains('will-reveal')) {
      reveal(target);
    }
    setCurrent(id);
  }

  function update() {
    const line = window.innerHeight * 0.35;
    const rects = spied.map((s) => s.getBoundingClientRect());
    let current = spied[0];

    rects.forEach((r, i) => {
      if (r.top <= line) current = spied[i];
    });

    if (atBottom()) {
      current = spied[spied.length - 1];
      sections.forEach(reveal);
    }

    if (pinned) {
      const i = spied.findIndex((s) => s.id === pinned);
      if (i > -1 && rects[i].bottom > 0 && rects[i].top < window.innerHeight) {
        current = spied[i];
      } else {
        pinned = null;
      }
    }

    if (current) setCurrent(current.id);
  }

  const unpin = () => {
    pinned = null;
  };

  ['wheel', 'touchmove'].forEach((name) => window.addEventListener(name, unpin, { passive: true }));
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
      unpin();
    }
  });

  links.forEach((a) => a.addEventListener('click', () => pin(a.hash.slice(1))));
  window.addEventListener('hashchange', () => pin(location.hash.slice(1)));
  window.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      update();
    });
  }, { passive: true });

  update();
});
