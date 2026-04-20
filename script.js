/* ═══════════════════════════════════════════════════════════════
   LENSA & CAHAYA — Photography Portfolio
   JavaScript: Navbar, Carousel, Scroll Reveal, Lightbox, Filter
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     1. NAVBAR — Scroll shadow + mobile toggle
  ───────────────────────────────────────── */

  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  // Add shadow/blur class when page is scrolled
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Toggle mobile menu
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile menu when a link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    });
  });


  /* ─────────────────────────────────────────
     2. SCROLL REVEAL — Fade-in on scroll
  ───────────────────────────────────────── */

  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger delay for sibling elements
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay * 1000);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  // Add stagger delays to section children where applicable
  document.querySelectorAll('.filter-row .filter-btn').forEach((el, i) => {
    el.dataset.delay = (i * 0.06).toFixed(2);
  });

  revealElements.forEach(el => revealObserver.observe(el));


  /* ─────────────────────────────────────────
     3. CAROUSEL — Drag, buttons, dots
  ───────────────────────────────────────── */

  const track    = document.getElementById('carouselTrack');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotGroup = document.getElementById('dotGroup');

  let isDragging    = false;
  let startX        = 0;
  let scrollStart   = 0;
  let activeFilter  = 'all';

  // ── Build dots based on visible cards ──
  function buildDots() {
    dotGroup.innerHTML = '';
    const cards = getVisibleCards();
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
      dot.addEventListener('click', () => scrollToCard(i));
      dotGroup.appendChild(dot);
    });
  }

  function getVisibleCards() {
    return Array.from(track.querySelectorAll('.photo-card:not(.hidden)'));
  }

  // ── Update active dot based on scroll position ──
  function updateActiveDot() {
    const cards = getVisibleCards();
    if (!cards.length) return;

    const trackLeft     = track.getBoundingClientRect().left;
    const cardWidth     = cards[0].offsetWidth + 20; // 20 = gap
    const currentIndex  = Math.round(track.scrollLeft / cardWidth);
    const clampedIndex  = Math.max(0, Math.min(currentIndex, cards.length - 1));

    document.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === clampedIndex);
    });
  }

  // ── Scroll to a specific card index ──
  function scrollToCard(index) {
    const cards = getVisibleCards();
    if (!cards[index]) return;
    track.scrollTo({
      left: cards[index].offsetLeft - track.offsetLeft,
      behavior: 'smooth'
    });
  }

  // ── Prev / Next buttons ──
  prevBtn.addEventListener('click', () => {
    const cards    = getVisibleCards();
    const cardW    = cards[0] ? cards[0].offsetWidth + 20 : 300;
    const current  = Math.round(track.scrollLeft / cardW);
    scrollToCard(Math.max(0, current - 1));
  });

  nextBtn.addEventListener('click', () => {
    const cards   = getVisibleCards();
    const cardW   = cards[0] ? cards[0].offsetWidth + 20 : 300;
    const current = Math.round(track.scrollLeft / cardW);
    scrollToCard(Math.min(cards.length - 1, current + 1));
  });

  // ── Listen to scroll for dot updates ──
  track.addEventListener('scroll', updateActiveDot, { passive: true });

  // ── Drag to scroll (mouse) ──
  track.addEventListener('mousedown', (e) => {
    isDragging  = true;
    startX      = e.pageX - track.offsetLeft;
    scrollStart = track.scrollLeft;
    track.classList.add('grabbing');
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x    = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    track.scrollLeft = scrollStart - walk;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    track.classList.remove('grabbing');
  });

  // ── Touch support ──
  track.addEventListener('touchstart', (e) => {
    startX      = e.touches[0].pageX - track.offsetLeft;
    scrollStart = track.scrollLeft;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    const x    = e.touches[0].pageX - track.offsetLeft;
    const walk = (x - startX) * 1.2;
    track.scrollLeft = scrollStart - walk;
  }, { passive: true });

  // Initialize dots
  buildDots();


  /* ─────────────────────────────────────────
     4. CATEGORY FILTER
  ───────────────────────────────────────── */

  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button style
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      activeFilter = btn.dataset.filter;
      const allCards = document.querySelectorAll('.photo-card');

      allCards.forEach(card => {
        const cat = card.dataset.cat;
        if (activeFilter === 'all' || cat === activeFilter) {
          card.classList.remove('hidden');
          // Animate back in
          card.style.opacity = '0';
          card.style.transform = 'scale(0.92)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          });
        } else {
          card.classList.add('hidden');
        }
      });

      // Reset scroll and rebuild dots
      track.scrollLeft = 0;
      buildDots();
    });
  });


  /* ─────────────────────────────────────────
     5. LIGHTBOX — Click photo to expand
  ───────────────────────────────────────── */

  const lightbox       = document.getElementById('lightbox');
  const lightboxImg    = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose  = document.getElementById('lightboxClose');

  // Open lightbox on card click
  document.querySelectorAll('.photo-card').forEach(card => {
    card.addEventListener('click', () => {
      if (isDragging) return; // Don't open while dragging

      const img     = card.querySelector('img');
      const title   = card.querySelector('.card-title');
      const cat     = card.querySelector('.card-cat');

      lightboxImg.src            = img.src;
      lightboxImg.alt            = img.alt;
      lightboxCaption.textContent = `${title.textContent}  ·  ${cat.textContent}`;

      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close lightbox
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Close with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });


  /* ─────────────────────────────────────────
     6. SMOOTH SCROLL for anchor links
  ───────────────────────────────────────── */

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = navbar.offsetHeight + 16;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ─────────────────────────────────────────
     7. ACTIVE NAV LINK — Highlight on scroll
  ───────────────────────────────────────── */

  const sections  = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(a => {
            a.style.color = a.getAttribute('href') === `#${id}`
              ? 'var(--accent)'
              : '';
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(s => sectionObserver.observe(s));

});
