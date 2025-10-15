// modules/interactive-map.js (NAOS - solo modelos) — DEBUG BUILD

const inactiveColor = '#f0f0f0ff';
const svgUrl = '../../assets/img/interactive-map-og.svg';

const DEBUG = false;
const log = (...args) => DEBUG && console.log('[InteractiveMap]', ...args);
const warn = (...args) => DEBUG && console.warn('[InteractiveMap]', ...args);
const err = (...args) => DEBUG && console.error('[InteractiveMap]', ...args);

export function setupInteractiveMap() {
  const interactiveMapContainer = document.getElementById(
    'interactive-map-container'
  );
  if (!interactiveMapContainer) {
    err('No se encontró #interactive-map-container');
    return;
  }

  log('Cargando SVG desde:', svgUrl);
  fetch(svgUrl)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return res.text();
    })
    .then((svgText) => {
      interactiveMapContainer.innerHTML = svgText;
      log('SVG inyectado. Inicializando…');
      initializeInteractiveMap(interactiveMapContainer);
    })
    .catch((e) => {
      err('Error al cargar el mapa SVG:', e);
      interactiveMapContainer.innerHTML = '<p>Error loading SVG map.</p>';
    });

  // Estilos para el estado "inactive" (afecta al nodo y a sus hijos)
  document.head.insertAdjacentHTML(
    'beforeend',
    `<style id="interactive-map-runtime-styles">
      .inactive, .inactive * {
        fill: ${inactiveColor} !important;
        transition: fill 0.3s ease;
      }
      [class*='-tower'] * {
        transition: fill 0.3s ease;
      }
    </style>`
  );
}

function initializeInteractiveMap(container) {
  const svgElement = container.querySelector('svg');
  if (!svgElement) {
    err('No se encontró <svg> dentro de #interactive-map-container');
    return;
  }

  // Seleccionar cualquier elemento que represente un modelo (g, path, polygon, etc.)
  const modelGroups = svgElement.querySelectorAll("[class*='-tower']");
  const modelArray = Array.from(modelGroups);
  log(`Modelos detectados en SVG: ${modelArray.length}`);

  // Resumen por torre
  const groupByTower = groupModelsByTower(modelArray);
  Object.entries(groupByTower).forEach(([tower, arr]) => {
    log(`  - ${tower}: ${arr.length} modelo(s)`);
  });

  // Validaciones de IDs en SVG
  validateSvgIds(modelArray);

  // Validar que todos los data-target del acordeón existan en el SVG
  validateHtmlTargetsAgainstSvg(svgElement);

  function resetColors() {
    modelArray.forEach((group) => group.classList.remove('inactive'));
    log('Reset de colores (se quitaron .inactive)');
  }

  function highlightGroupById(groupId) {
    if (!groupId) return;
    const found = modelArray.some((g) => g.id === groupId);
    if (!found) {
      warn('highlightGroupById: ID no encontrado en SVG:', groupId);
    }
    modelArray.forEach((group) => {
      if (group.id === groupId) {
        group.classList.remove('inactive');
      } else {
        group.classList.add('inactive');
      }
    });
    log('Highlight aplicado a:', groupId);
  }

  // Botón Reset Map al final del panel lateral
  const selector = document.querySelector('.map-selector');
  if (!selector) {
    err('No se encontró .map-selector');
    return;
  }
  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset Map';
  resetBtn.classList.add('reset-map-btn');
  resetBtn.setAttribute('data-i18n', 'map.reset');
  resetBtn.addEventListener('click', () => {
    resetColors();
    document
      .querySelectorAll('.tower, .model')
      .forEach((el) => el.classList.remove('is-open'));
    log('Reset Map: acordeón cerrado y colores normalizados');
  });
  selector.appendChild(resetBtn); // asegura que quede al final
  log('Reset Map Button añadido al final de .map-selector');

  const accordion = document.querySelector('.map-selector');
  if (!accordion) {
    err('No se encontró el panel del acordeón (.map-selector)');
    return;
  }

  // Toggle por TORRE
  accordion.querySelectorAll('.tower-header').forEach((header) => {
    header.addEventListener('click', () => {
      const tower = header.parentElement;
      const isOpen = tower.classList.contains('is-open');
      document
        .querySelectorAll('.tower')
        .forEach((t) => t.classList.remove('is-open'));
      tower.classList.toggle('is-open', !isOpen);
      log(
        'Toggle torre:',
        getTowerName(tower),
        '=>',
        !isOpen ? 'OPEN' : 'CLOSE'
      );
    });
  });

  // Toggle por MODELO (y highlight del grupo en el SVG)
  accordion.querySelectorAll('.model-header').forEach((header) => {
    header.addEventListener('click', (e) => {
      e.stopPropagation();
      const model = header.parentElement; // .model
      const tower = model.closest('.tower');

      // Asegurar torre abierta y cerrar otros modelos de esa torre
      if (tower) {
        tower.classList.add('is-open');
        tower.querySelectorAll('.model').forEach((m) => {
          if (m !== model) m.classList.remove('is-open');
        });
      }

      // Alternar el modelo activo
      const willOpen = !model.classList.contains('is-open');
      model.classList.toggle('is-open', willOpen);
      log(
        'Toggle modelo:',
        header.textContent.trim(),
        '=>',
        willOpen ? 'OPEN' : 'CLOSE',
        '| Torre:',
        getTowerName(tower)
      );

      // Highlight del grupo correspondiente en el SVG
      const groupId = header.dataset.target;
      if (groupId) {
        highlightGroupById(groupId);
      } else {
        warn('model-header sin data-target:', header.textContent.trim());
      }

      // En móviles, llevar el foco al inicio de la sección
      const residencesSection = document.getElementById('residences');
      if (window.innerWidth < 768 && residencesSection) {
        residencesSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });

  // Utilidad: exponer helpers para inspección manual en consola
  if (DEBUG) {
    window.__IMAP__ = {
      modelArray,
      groupByTower,
      resetColors,
      highlightGroupById,
      listSvgIds: () => modelArray.map((n) => n.id),
    };
    log('DEBUG helpers disponibles en window.__IMAP__');
  }
}

/* ---------- Helpers & Validators ---------- */

function groupModelsByTower(nodes) {
  const buckets = { oceanview: [], hillsview: [], unknown: [] };
  nodes.forEach((n) => {
    const cls = (n.getAttribute('class') || '').toLowerCase();
    if (cls.includes('oceanview-tower') || cls.includes('ocean-view-tower')) {
      buckets.oceanview.push(n);
    } else if (
      cls.includes('hillsview-tower') ||
      cls.includes('hills-view-tower')
    ) {
      buckets.hillsview.push(n);
    } else {
      buckets.unknown.push(n);
    }
  });
  return buckets;
}

function validateSvgIds(nodes) {
  const ids = nodes.map((n) => n.id).filter(Boolean);
  const dupes = findDuplicates(ids);
  if (dupes.length) {
    warn('IDs duplicados en SVG:', dupes);
  }
  const missingId = nodes.filter((n) => !n.id);
  if (missingId.length) {
    warn(
      `Hay ${missingId.length} elemento(s) con clase "*-tower" sin atributo id:`,
      missingId
    );
  }
}

function validateHtmlTargetsAgainstSvg(svgElement) {
  const svgIds = new Set(
    Array.from(svgElement.querySelectorAll('[id]')).map((n) => n.id)
  );
  const headers = document.querySelectorAll('.model-header[data-target]');
  const targets = Array.from(headers).map((h) => h.dataset.target);

  const missing = targets.filter((t) => !svgIds.has(t));
  const dupes = findDuplicates(targets);

  if (missing.length) {
    warn('data-target sin match en SVG:', missing);
  } else {
    log('Todos los data-target del HTML existen en el SVG ✅');
  }
  if (dupes.length) {
    warn('data-target duplicados en HTML:', dupes);
  }

  // Log de pares header -> target para inspección
  if (DEBUG) {
    headers.forEach((h) => {
      log('Header:', h.textContent.trim(), '| target:', h.dataset.target);
    });
  }
}

function findDuplicates(arr) {
  const seen = new Set();
  const d = new Set();
  for (const x of arr) {
    if (seen.has(x)) d.add(x);
    else seen.add(x);
  }
  return Array.from(d);
}

function getTowerName(towerEl) {
  if (!towerEl) return '(sin torre)';
  return (towerEl.getAttribute('data-tower') || '(sin data-tower)').trim();
}
