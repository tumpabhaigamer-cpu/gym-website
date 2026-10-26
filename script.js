(() => {
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!open));
      menuToggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
      mainNav.classList.toggle('is-open', !open);
    });
    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation');
        mainNav.classList.remove('is-open');
      });
    });
  }

  const timelineData = {
    week: { src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=85', alt: 'Members learning the strength training system', index: '01 / 04' },
    month: { src: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1000&q=85', alt: 'Member building strength during a training session', index: '02 / 04' },
    quarter: { src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=85', alt: 'Member progressing through a strength workout', index: '03 / 04' },
    year: { src: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1000&q=85', alt: 'Member working with a coach during training', index: '04 / 04' }
  };
  const timelineItems = Array.from(document.querySelectorAll('.timeline-item'));
  const expectImage = document.querySelector('#expect-image');
  const expectCaptionTitle = document.querySelector('#expect-caption-title');
  const expectDescription = document.querySelector('#expect-description');
  const captionIndex = document.querySelector('.caption-index');
  const timelinePanel = document.querySelector('#timeline-panel');

  timelineItems.forEach((item) => {
    const activate = () => {
      timelineItems.forEach((other) => {
        const active = other === item;
        other.classList.toggle('is-active', active);
        other.setAttribute('aria-selected', String(active));
      });
      const key = item.dataset.image;
      const image = timelineData[key];
      if (expectImage && image) {
        expectImage.src = image.src;
        expectImage.alt = image.alt;
        expectImage.style.animation = 'none';
        void expectImage.offsetWidth;
        expectImage.style.animation = '';
      }
      if (expectCaptionTitle) expectCaptionTitle.textContent = item.dataset.title;
      if (expectDescription) expectDescription.textContent = item.dataset.description;
      if (captionIndex && image) captionIndex.textContent = image.index;
      if (timelinePanel) timelinePanel.setAttribute('aria-labelledby', item.id);
    };
    item.addEventListener('click', activate);
    item.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        const next = timelineItems[(timelineItems.indexOf(item) + 1) % timelineItems.length];
        next.focus(); next.click();
      }
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const previous = timelineItems[(timelineItems.indexOf(item) - 1 + timelineItems.length) % timelineItems.length];
        previous.focus(); previous.click();
      }
    });
  });

  const locationForm = document.querySelector('#location-form');
  const locationInput = document.querySelector('#location-query');
  const locationMessage = document.querySelector('#location-message');
  if (locationForm && locationInput) {
    locationForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = locationInput.value.trim();
      if (!query) {
        locationInput.focus();
        if (locationMessage) locationMessage.textContent = 'Enter a ZIP code or city to continue.';
        return;
      }
      if (locationMessage) locationMessage.textContent = `Searching nearby gyms for “${query}”…`;
      const locationsSearch = `https://www.google.com/maps/search/gyms+near+${encodeURIComponent(query)}`;
      window.open(locationsSearch, '_blank', 'noopener,noreferrer');
    });
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  const scatterSection = document.querySelector('#scatter-section');
  if (scatterSection && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const scatterStage = scatterSection.querySelector('.scatter-stage');
    const scatterCards = Array.from(scatterSection.querySelectorAll('.scatter-card'));
    const scatterTitle = scatterSection.querySelector('.scatter-lockup');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      scatterCards.forEach((card) => {
        gsap.set(card, {
          x: () => Number(card.dataset.x) * window.innerWidth / 100 * (window.innerWidth < 768 ? .55 : 1),
          y: () => Number(card.dataset.y) * window.innerHeight / 100 * (window.innerWidth < 768 ? .55 : 1),
          rotation: Number(card.dataset.rotation), scale: 1, opacity: .82
        });
      });
      gsap.set(scatterTitle, { scale: 1, opacity: 1 });
    } else {
      const mm = gsap.matchMedia();
      mm.add({ desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' }, (context) => {
        const mobile = context.conditions.mobile;
        const radius = mobile ? .55 : 1;
        const cards = gsap.utils.toArray('.scatter-card', scatterSection);
        gsap.set(cards, {
          x: 0, y: 0, scale: .45, opacity: 0,
          rotation: () => gsap.utils.random(-15, 15)
        });
        gsap.set(scatterTitle, { scale: .88, opacity: .25 });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: scatterSection,
            start: 'top top',
            end: '+=220%',
            scrub: 1.2,
            pin: scatterStage,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });
        timeline.to(scatterTitle, { scale: 1, opacity: 1, ease: 'none' }, 0);
        timeline.to(cards, {
          x: (index, card) => Number(card.dataset.x) * window.innerWidth / 100 * radius,
          y: (index, card) => Number(card.dataset.y) * window.innerHeight / 100 * radius,
          scale: 1,
          opacity: .88,
          rotation: (index, card) => Number(card.dataset.rotation),
          stagger: 0,
          ease: 'none'
        }, 0);

        const hoverIn = (event) => {
          const card = event.currentTarget;
          if (timeline.scrollTrigger && timeline.scrollTrigger.progress > .2) {
            gsap.to(card, { scale: 1.06, duration: .35, ease: 'power2.out', overwrite: 'auto' });
          }
        };
        const hoverOut = (event) => {
          const card = event.currentTarget;
          const progress = timeline.scrollTrigger ? timeline.scrollTrigger.progress : 0;
          gsap.to(card, { scale: progress > .2 ? 1 : .45, duration: .4, ease: 'power2.out', overwrite: 'auto' });
        };
        cards.forEach((card) => {
          card.addEventListener('pointerenter', hoverIn);
          card.addEventListener('pointerleave', hoverOut);
        });

        const onPointerMove = (event) => {
          const progress = timeline.scrollTrigger ? timeline.scrollTrigger.progress : 0;
          if (progress < .35) return;
          const rect = scatterStage.getBoundingClientRect();
          const nx = (event.clientX - rect.left) / rect.width - .5;
          const ny = (event.clientY - rect.top) / rect.height - .5;
          cards.forEach((card) => {
            const depth = Number(card.dataset.depth) || 1;
            gsap.to(card, {
              rotationX: -ny * 3.2 * depth,
              rotationY: nx * 3.2 * depth,
              transformPerspective: 850,
              duration: .55,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          });
        };
        const resetParallax = () => cards.forEach((card) => gsap.to(card, { rotationX: 0, rotationY: 0, duration: .7, ease: 'power2.out' }));
        scatterStage.addEventListener('pointermove', onPointerMove, { passive: true });
        scatterStage.addEventListener('pointerleave', resetParallax, { passive: true });
        return () => {
          scatterStage.removeEventListener('pointermove', onPointerMove);
          scatterStage.removeEventListener('pointerleave', resetParallax);
          cards.forEach((card) => {
            card.removeEventListener('pointerenter', hoverIn);
            card.removeEventListener('pointerleave', hoverOut);
          });
          timeline.scrollTrigger && timeline.scrollTrigger.kill();
          timeline.kill();
        };
      });
    }
  }
})();
