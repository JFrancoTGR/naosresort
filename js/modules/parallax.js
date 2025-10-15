export function initParallaxDivider({
  selector = '.parallax-divider',
  factor = 0.35, // intensidad del parallax
} = {}) {
  const elements = [...document.querySelectorAll(selector)];
  if (!elements.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function update(el) {
    const rect = el.getBoundingClientRect();
    const localFactor = parseFloat(el.dataset.parallaxFactor) || factor;
    const viewportH = window.innerHeight;
    const deltaCenter = rect.top + rect.height / 2 - viewportH / 2;
    let offset = deltaCenter * localFactor;

    // Evita que la imagen “descubra” fondo vacío
    const maxOffset = rect.height * 0.15; // coincide con top/bottom: -15%
    offset = clamp(offset, -maxOffset, maxOffset);

    el.style.setProperty('--parallax-offset', `${offset}px`);
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      elements.forEach(update);
      ticking = false;
    });
  }

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) update(entry.target);
    }
  });
  elements.forEach((el) => io.observe(el));

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  return () => {
    io.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}
