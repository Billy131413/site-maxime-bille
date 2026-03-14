/* ============================================
   PORTFOLIO — Chargement, filtrage et modal carousel
   Reproduit le carousel du site maxime-bille.fr
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('portfolio-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const modal = document.getElementById('project-modal');

  if (!grid) return;

  let projects = [];
  let currentProjectIndex = 0;
  let carouselCurrent = 0;

  // Éléments du modal (structure HTML existante)
  const modalClose = document.getElementById('modal-close');
  const carouselTrack = document.getElementById('carousel-track');
  const carouselPrev = document.getElementById('carousel-prev');
  const carouselNext = document.getElementById('carousel-next');
  const carouselDots = document.getElementById('carousel-dots');
  const modalTitle = document.getElementById('modal-title');
  const modalSector = document.getElementById('modal-sector');
  const modalYear = document.getElementById('modal-year');
  const modalTechs = document.getElementById('modal-techs');
  const modalChallenge = document.getElementById('modal-challenge');
  const modalSolution = document.getElementById('modal-solution');
  const modalResult = document.getElementById('modal-result');
  const modalMetrics = document.getElementById('modal-metrics');
  const modalPrev = document.getElementById('modal-prev');
  const modalNext = document.getElementById('modal-next');

  // --- Chargement des données ---
  async function loadProjects() {
    try {
      const response = await fetch('data/portfolio.json');
      if (!response.ok) throw new Error('Erreur chargement portfolio');
      projects = await response.json();
      renderProjects(projects, true);
      checkHash();
    } catch (error) {
      console.warn('Portfolio JSON non trouvé, utilisation du contenu statique.');
    }
  }

  // --- Rendu des cartes ---
  function renderProjects(items, animate = false) {
    if (!items.length) {
      grid.innerHTML = '<p class="text-center text-muted" style="grid-column:1/-1;">Aucun projet trouvé.</p>';
      return;
    }

    grid.innerHTML = items.map((project) => {
      const realIndex = projects.indexOf(project);
      return `
      <article class="card reveal" data-category="${project.category || ''}" data-index="${realIndex}">
        <div class="card__image-wrapper" style="position:relative;overflow:hidden;">
          <img
            class="card__image"
            src="${project.thumbnail || 'assets/images/placeholder.svg'}"
            alt="${project.title} — ${project.sector || 'Projet'}"
            loading="lazy"
            width="600"
            height="375"
          >
        </div>
        <div class="card__body">
          <span class="card__tag">${project.sector || 'Projet'}</span>
          <h3 class="card__title">${project.title}</h3>
          <p class="card__text">${project.challenge || ''}</p>
        </div>
        <div class="card__footer">
          <div class="card__techs">
            ${(project.tech || []).map(t => `<span class="card__tech">${t}</span>`).join('')}
          </div>
          <button class="card__link" data-project-index="${realIndex}" aria-label="Voir le projet ${project.title}">
            Voir le projet
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </article>
    `}).join('');

    // Événements sur les boutons "Voir le projet"
    grid.querySelectorAll('.card__link[data-project-index]').forEach(btn => {
      btn.addEventListener('click', () => {
        openModal(parseInt(btn.dataset.projectIndex, 10));
      });
    });

    // Animer uniquement au premier chargement, pas au filtrage
    if (animate && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.utils.toArray('#portfolio-grid .reveal').forEach(el => {
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
          }
        );
      });
    } else {
      grid.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
    }
  }

  // --- Filtrage ---
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      if (filter === 'all') {
        renderProjects(projects);
      } else {
        renderProjects(projects.filter(p => p.category === filter));
      }
    });
  });

  // ==============================================
  //  CAROUSEL (même logique que maxime-bille.fr)
  // ==============================================

  function carouselGoTo(index) {
    const slides = carouselTrack.querySelectorAll('.carousel__slide');
    const total = slides.length;
    if (!total) return;

    carouselCurrent = Math.max(0, Math.min(index, total - 1));

    // translateX basé sur la largeur réelle du carousel
    const carousel = carouselTrack.parentElement;
    const slideWidth = Math.round(carousel.getBoundingClientRect().width);
    carouselTrack.style.transform = `translateX(-${carouselCurrent * slideWidth}px)`;

    // Mettre à jour les dots
    carouselDots.querySelectorAll('.carousel__dot').forEach((dot, i) => {
      dot.classList.toggle('is-active', i === carouselCurrent);
    });

    // Mettre à jour les flèches
    if (carouselPrev) carouselPrev.disabled = carouselCurrent === 0;
    if (carouselNext) carouselNext.disabled = carouselCurrent === total - 1;
  }

  // Flèches du carousel
  if (carouselPrev) {
    carouselPrev.addEventListener('click', () => carouselGoTo(carouselCurrent - 1));
  }
  if (carouselNext) {
    carouselNext.addEventListener('click', () => carouselGoTo(carouselCurrent + 1));
  }

  // Redimensionnement (debounce)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (modal && modal.classList.contains('active')) {
        carouselGoTo(carouselCurrent);
      }
    }, 150);
  });

  // --- Swipe tactile ---
  function addSwipe(element, onLeft, onRight) {
    let startX = 0;
    let startY = 0;
    element.addEventListener('touchstart', (e) => {
      startX = e.changedTouches[0].screenX;
      startY = e.changedTouches[0].screenY;
    }, { passive: true });
    element.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - startX;
      const dy = e.changedTouches[0].screenY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) onLeft();
        else onRight();
      }
    }, { passive: true });
  }

  // Swipe sur le carousel
  if (carouselTrack) {
    addSwipe(carouselTrack,
      () => carouselGoTo(carouselCurrent + 1),
      () => carouselGoTo(carouselCurrent - 1)
    );
  }

  // ==============================================
  //  MODAL — Ouvrir / Fermer / Naviguer
  // ==============================================

  function openModal(index) {
    if (!modal || !projects[index]) return;
    currentProjectIndex = index;
    populateModal(projects[index]);
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function navigateProject(direction) {
    const newIndex = currentProjectIndex + direction;
    if (newIndex >= 0 && newIndex < projects.length) {
      currentProjectIndex = newIndex;
      populateModal(projects[currentProjectIndex]);
      // Remonter en haut du modal
      modal.scrollTop = 0;
      const inner = modal.querySelector('.modal');
      if (inner) inner.scrollTop = 0;
    }
  }

  function populateModal(project) {
    const screenshots = project.screenshots || [project.heroImage || project.thumbnail];

    // --- Carousel : injecter les slides ---
    carouselTrack.innerHTML = screenshots.map((src, i) => `
      <div class="carousel__slide">
        <img src="${src}" alt="${project.title} — Capture ${i + 1}" loading="lazy">
      </div>
    `).join('');

    // --- Carousel : injecter les dots ---
    carouselDots.innerHTML = '';
    screenshots.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Image ${i + 1}`);
      dot.addEventListener('click', () => carouselGoTo(i));
      carouselDots.appendChild(dot);
    });

    // Initialiser le carousel à la première slide
    carouselCurrent = 0;
    carouselTrack.style.transform = 'translateX(0)';
    // Petit délai pour que le DOM soit rendu avant de calculer les dimensions
    requestAnimationFrame(() => carouselGoTo(0));

    // --- Infos projet ---
    if (modalTitle) modalTitle.textContent = project.title;
    if (modalSector) modalSector.textContent = project.sector || '';
    if (modalYear) modalYear.textContent = project.year || '';

    // Tech badges
    if (modalTechs) {
      modalTechs.innerHTML = (project.tech || []).map(t =>
        `<span class="card__tech">${t}</span>`
      ).join('');
    }

    // Challenge / Solution / Résultat
    if (modalChallenge) modalChallenge.textContent = project.challenge || 'Non renseigné.';
    if (modalSolution) modalSolution.textContent = project.solution || 'Non renseigné.';
    if (modalResult) modalResult.textContent = project.result || 'Non renseigné.';

    // Métriques
    if (modalMetrics) {
      const m = project.metrics;
      if (m) {
        modalMetrics.innerHTML = `
          ${m.pages ? `<div class="modal__metric"><span class="modal__metric-value">${m.pages}</span><span class="modal__metric-label">Pages</span></div>` : ''}
          ${m.type ? `<div class="modal__metric"><span class="modal__metric-value">${m.type}</span><span class="modal__metric-label">Type</span></div>` : ''}
          ${m.delai ? `<div class="modal__metric"><span class="modal__metric-value">${m.delai}</span><span class="modal__metric-label">Délai</span></div>` : ''}
        `;
        modalMetrics.style.display = '';
      } else {
        modalMetrics.style.display = 'none';
      }
    }

    // Navigation projet précédent/suivant
    if (modalPrev) modalPrev.disabled = currentProjectIndex === 0;
    if (modalNext) modalNext.disabled = currentProjectIndex === projects.length - 1;
  }

  // --- Événements modal ---
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalPrev) modalPrev.addEventListener('click', () => navigateProject(-1));
  if (modalNext) modalNext.addEventListener('click', () => navigateProject(1));

  // ==============================================
  //  LIGHTBOX (même logique que maxime-bille.fr)
  // ==============================================

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('.lightbox__img') : null;
  const lightboxClose = lightbox ? lightbox.querySelector('.lightbox__close') : null;
  const lightboxLeft = lightbox ? lightbox.querySelector('.lightbox__arrow--left') : null;
  const lightboxRight = lightbox ? lightbox.querySelector('.lightbox__arrow--right') : null;
  let lightboxImages = [];
  let lightboxIndex = 0;

  function updateLightbox() {
    if (!lightboxImg || !lightboxImages[lightboxIndex]) return;
    lightboxImg.src = lightboxImages[lightboxIndex].src;
    lightboxImg.alt = lightboxImages[lightboxIndex].alt;
    if (lightboxLeft) lightboxLeft.disabled = lightboxIndex === 0;
    if (lightboxRight) lightboxRight.disabled = lightboxIndex === lightboxImages.length - 1;
  }

  function openLightbox(images, startIndex) {
    if (!lightbox) return;
    lightboxImages = images;
    lightboxIndex = startIndex;
    updateLightbox();
    lightbox.classList.add('is-open');
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
  }

  // Clic sur une image du carousel → ouvre la lightbox
  if (carouselTrack) {
    carouselTrack.addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (!img) return;
      const allImgs = Array.from(carouselTrack.querySelectorAll('.carousel__slide img'));
      const index = allImgs.indexOf(img);
      openLightbox(allImgs, index >= 0 ? index : 0);
    });
  }

  // Flèches lightbox
  if (lightboxLeft) {
    lightboxLeft.addEventListener('click', () => {
      if (lightboxIndex > 0) { lightboxIndex--; updateLightbox(); }
    });
  }

  if (lightboxRight) {
    lightboxRight.addEventListener('click', () => {
      if (lightboxIndex < lightboxImages.length - 1) { lightboxIndex++; updateLightbox(); }
    });
  }

  // Fermer lightbox
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Swipe sur la lightbox
    addSwipe(lightbox,
      () => { if (lightboxIndex < lightboxImages.length - 1) { lightboxIndex++; updateLightbox(); } },
      () => { if (lightboxIndex > 0) { lightboxIndex--; updateLightbox(); } }
    );
  }

  // Clavier : gère lightbox ET modal/carousel
  document.addEventListener('keydown', (e) => {
    // Lightbox ouverte → priorité
    if (lightbox && lightbox.classList.contains('is-open')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && lightboxIndex > 0) { lightboxIndex--; updateLightbox(); }
      if (e.key === 'ArrowRight' && lightboxIndex < lightboxImages.length - 1) { lightboxIndex++; updateLightbox(); }
      return;
    }

    // Modal ouverte
    if (modal && modal.classList.contains('active')) {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') carouselGoTo(carouselCurrent - 1);
      if (e.key === 'ArrowRight') carouselGoTo(carouselCurrent + 1);
    }
  });

  // Fermer en cliquant l'overlay du modal
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // --- Ouvrir un projet via hash URL (ex: #concept-fleuriste) ---
  function checkHash() {
    const hash = window.location.hash.replace('#', '');
    if (!hash || !projects.length) return;
    const index = projects.findIndex(p => p.slug === hash);
    if (index !== -1) openModal(index);
  }

  window.addEventListener('hashchange', checkHash);

  // Chargement initial
  loadProjects();
});
