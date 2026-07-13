import { $, $$, lockScroll, unlockScroll } from '../utils.js';

const galleryMeta = [
  { label: 'Puente Hercílio Luz', desc: 'Conecta el continente con la Isla de Florianópolis' },
  { label: 'Piscinas Naturales', desc: 'Flotar en aguas calmas rodeado por la increíble energía de las piedras' },
  { label: 'Rincones de Floripa', desc: 'El reflejo del sol en el canal, casitas coloridas y la amigable fauna del lugar' },
  { label: 'Paseo entre Dos Aguas', desc: 'Un sendero único rodeado de naturaleza, perfecto para ver el amanecer y sentir la brisa' },
  { label: 'Tradición "Manezinha"', desc: 'Compartir la paciencia, el silencio del agua y la complicidad de una buena tarde de pesca' },
  { label: 'Jaque Mate en la Barra', desc: 'El punto de encuentro donde los lugareños desafían al tiempo frente al mar' },
  { label: 'Buscando la Ola Perfecta', desc: 'El mar, una tabla bajo el brazo y caminatas en la orilla que recargan de energía antes de entrar al agua' },
  { label: 'Sombra y Calma', desc: 'Un rincón perfecto para sentarse a contemplar el reflejo de la villa en el agua' },
  { label: 'Bahía de la Barra', desc: 'La bahía protegida por el espigón de piedra en una de las mejores playas de Floripa' },
  { label: 'Trilha do Morro', desc: 'El esfuerzo de caminar por el morro se olvida al descubrir el lado más virgen y salvaje de la Isla' },
  { label: 'Puente de Barra da Lagoa', desc: 'Una panorámica perfecta donde el río se encuentra con el mar' },
  { label: 'Pausa en el Paraíso', desc: 'Detener el tiempo, invitando a la desconexión total' },
  { label: 'Caminos Secretos', desc: 'Un recorrido de trekking rodeado de vegetación nativa y aventura pura' },
  { label: 'Noite na Barra', desc: 'Cenário dos sonhos onde barcos e luzes douradas inspiram o amor' },
  { label: 'Hospitalidad Costera', desc: 'La calidez de los paradores locales con una excelente infraestructura' },
  { label: 'Praia da Barra', desc: 'Vista aérea panorâmica de uma praia vibrante com areias douradas e o mar cristalino' }
];

const galleryImages = galleryMeta.map((meta, i) => {
  const num = String(i + 1).padStart(2, '0');
  return {
    src: `./imgs/floripa-${num}.jpg`,
    alt: meta.label,
    label: meta.label,
    desc: meta.desc,
    _placeholder: './imgs/star.png'
  };
});

let currentSlide = 0;
let carouselAutoplay = null;
let carouselProgressInterval = null;
const AUTOPLAY_DELAY = 5000;
let isMainContentVisible = false;

export function stopAutoplay() {
  if (carouselAutoplay) clearInterval(carouselAutoplay);
  if (carouselProgressInterval) clearInterval(carouselProgressInterval);
  const progressBar = document.getElementById('carouselProgress');
  if (progressBar) progressBar.style.width = '0%';
}

export { galleryMeta, galleryImages, startAutoplay };

export function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const dotsContainer = document.getElementById('carouselDots');
  const counter = document.getElementById('carouselCounter');
  const carouselEl = document.getElementById('carousel');
  if (!track) return;
  isMainContentVisible = true;
  track.innerHTML = '';
  if (dotsContainer) dotsContainer.innerHTML = '';

  galleryImages.forEach((img, idx) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.innerHTML = `
      <img src="${img.src}" alt="${img.alt}" width="800" height="600" loading="lazy" decoding="async"
        onerror="this.onerror=null; this.src='${img._placeholder}'; this.classList.add('img-error');"
        data-title="${img.label || img.alt}" data-desc="${img.desc}">
      <div class="carousel-caption"><h3>${img.label}</h3></div>`;
    track.appendChild(slide);

    if (dotsContainer) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (idx === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Ir a imagen ' + (idx + 1));
      dot.addEventListener('click', () => { goToSlide(idx); resetAutoplay(); });
      dotsContainer.appendChild(dot);
    }
  });

  if (counter) counter.textContent = `1 / ${galleryImages.length}`;
  goToSlide(0);

  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });

  if (carouselEl) {
    let touchStartX = 0;
    carouselEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    carouselEl.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? nextSlide() : prevSlide();
        resetAutoplay();
      }
    }, { passive: true });
  }

  document.addEventListener('keydown', (e) => {
    if (!isMainContentVisible) return;
    if (e.key === 'ArrowLeft') { prevSlide(); resetAutoplay(); }
    if (e.key === 'ArrowRight') { nextSlide(); resetAutoplay(); }
  });

  initLightbox();
}

function goToSlide(idx) {
  const track = document.getElementById('carouselTrack');
  const counter = document.getElementById('carouselCounter');
  if (track) track.style.transform = `translateX(-${idx * 100}%)`;
  if (counter) counter.textContent = (idx + 1) + ' / ' + galleryImages.length;
  document.querySelectorAll('.carousel-dot').forEach((dot, i) => dot.classList.toggle('active', i === idx));
  currentSlide = idx;
}

function nextSlide() { goToSlide((currentSlide + 1) % galleryImages.length); }
function prevSlide() { goToSlide((currentSlide - 1 + galleryImages.length) % galleryImages.length); }

function startAutoplay() {
  stopAutoplay();
  let progress = 0;
  const progressBar = document.getElementById('carouselProgress');
  carouselAutoplay = setInterval(() => { nextSlide(); progress = 0; }, AUTOPLAY_DELAY);
  carouselProgressInterval = setInterval(() => {
    progress += 100 / (AUTOPLAY_DELAY / 50);
    if (progressBar) progressBar.style.width = progress + '%';
  }, 50);
}

function resetAutoplay() { stopAutoplay(); startAutoplay(); }

function initLightbox() {
  const track = document.getElementById('carouselTrack');
  let lightbox = document.getElementById('lightboxModal');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'lightboxModal';
    lightbox.className = 'lightbox-modal';
    lightbox.role = 'dialog';
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-labelledby', 'lightboxTitle');
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Cerrar">&times;</button>
      <div class="lightbox-content">
        <img id="lightboxImg" src="" alt="">
        <div class="lightbox-caption">
          <h3 id="lightboxTitle"></h3>
          <p id="lightboxDesc"></p>
        </div>
      </div>`;
    document.body.appendChild(lightbox);
  }

  const lightboxImg = $('#lightboxImg', lightbox);
  const lightboxTitle = $('#lightboxTitle', lightbox);
  const lightboxDesc = $('#lightboxDesc', lightbox);
  const lightboxClose = $('.lightbox-close', lightbox);

  if (track) {
    track.addEventListener('click', (e) => {
      const targetImg = e.target.closest('img');
      if (!targetImg) return;
      stopAutoplay();
      if (lightboxImg) lightboxImg.src = targetImg.src;
      if (lightboxImg) lightboxImg.alt = targetImg.alt;
      if (lightboxTitle) lightboxTitle.textContent = targetImg.getAttribute('data-title') || targetImg.alt;
      if (lightboxDesc) lightboxDesc.textContent = targetImg.getAttribute('data-desc') || '';
      lightbox.classList.add('is-active');
      lockScroll();
    });
  }

  const cerrarLightbox = () => {
    lightbox.classList.remove('is-active');
    unlockScroll();
    startAutoplay();
  };

  if (lightboxClose) lightboxClose.addEventListener('click', cerrarLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) cerrarLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-active')) {
      cerrarLightbox();
    }
  });
}
