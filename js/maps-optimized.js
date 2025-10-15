// === google-maps-lazy.js ===

const mapStyles = [
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.icon',
    stylers: [
      {
        color: '#adea2a',
      },
    ],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#ea3229',
      },
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#eaecf0',
      },
    ],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.fill',
    stylers: [
      {
        visibility: 'simplified',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#849d8d',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.icon',
    stylers: [
      {
        color: '#a09cb5',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#9d9084',
      },
    ],
  },
  {
    featureType: 'poi.sports_complex',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#9d9884',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#b0afaa',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#000000',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road.local',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#6b748a',
      },
    ],
  },
];

function initSelector() {
  const toggles = document.querySelectorAll('.js-category-open');

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const submenu = toggle.nextElementSibling;

      if (submenu.style.display === 'block') {
        submenu.style.display = 'none';
        toggle.classList.remove('active');
      } else {
        document
          .querySelectorAll('.category-selector__hide')
          .forEach((el) => (el.style.display = 'none'));
        document
          .querySelectorAll('.js-category-open')
          .forEach((el) => el.classList.remove('active'));
        submenu.style.display = 'block';
        toggle.classList.add('active');
      }
    });
  });

  document.querySelector('.js-selector-open')?.addEventListener('click', () => {
    document.querySelector('.category-selector')?.classList.add('active');
  });

  document
    .querySelector('.js-selector-close')
    ?.addEventListener('click', () => {
      document.querySelector('.category-selector')?.classList.remove('active');
    });
}

function initMap() {
  const markerIcons = {
    urban: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#6d6848',
      fillOpacity: 1,
      strokeWeight: 5,
      strokeColor: '#fff',
      scale: 15,
    },
    tourism: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#8a4f28',
      fillOpacity: 1,
      strokeWeight: 5,
      strokeColor: '#fff',
      scale: 15,
    },
    index: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#6b748a',
      fillOpacity: 1,
      strokeWeight: 5,
      strokeColor: '#fff',
      scale: 15,
    },
  };

  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 32.398989, lng: -117.090013 },
    zoom: 10,
    mapTypeControl: false,
    styles: mapStyles,
  });

  const locations = [
    // NAOS residences
    {
      idName: 'naos',
      name: 'NAOS Resort Living',
      lat: 32.398989,
      lng: -117.090013,
      category: 'index',
    },

    // Urban Areas & Connectivity
    {
      idName: 'san-diego-downtown',
      name: 'San Diego Downtown',
      lat: 32.7157412,
      lng: -117.1610752,
      category: 'urban',
    },
    {
      idName: 'tijuana-airport',
      name: 'Tijuana Airport',
      lat: 32.5408452,
      lng: -116.9690532,
      category: 'urban',
    },
    // Tourism & Experiences
    {
      idName: 'rosarito',
      name: 'Rosarito',
      lat: 32.3661011,
      lng: -117.0617553,
      category: 'tourism',
    },
    {
      idName: 'valle-de-guadalupe',
      name: 'Valle de Guadalupe',
      lat: 32.095412,
      lng: -116.5729,
      category: 'tourism',
    },
  ];

  const markers = {};
  locations.forEach((loc) => {
    const isWavve = loc.idName === 'naos';

    const marker = new google.maps.Marker({
      position: { lat: loc.lat, lng: loc.lng },
      map,
      title: loc.name,
      icon: isWavve
        ? {
            url: 'assets/ico/ico-pin-map.svg', // Ruta a tu SVG
            scaledSize: new google.maps.Size(35, 35), // Tamaño del ícono
            anchor: new google.maps.Point(24, 48), // Ancla al centro base
          }
        : markerIcons[loc.category] || null,
    });

    markers[loc.idName] = marker;
  });

  document.querySelector('.js-all')?.addEventListener('click', () => {
    document
      .querySelectorAll('[data-zone]')
      .forEach((el) => el.classList.remove('active'));
    map.setZoom(10);
    map.panTo({ lat: 32.398989, lng: -117.090013 });
  });

  document.querySelectorAll('[data-zone]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-zone');
      document
        .querySelectorAll('[data-zone]')
        .forEach((el) => el.classList.remove('active'));
      btn.classList.add('active');
      if (markers[id]) {
        map.panTo(markers[id].getPosition());
        map.setZoom(15);
      }
    });
  });

  initSelector();
}

const observer = new IntersectionObserver(
  (entries, obs) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/google-maps.css';
    document.head.appendChild(link);
    if (entries[0].isIntersecting) {
      const script = document.createElement('script');
      script.src =
        'https://maps.googleapis.com/maps/api/js?key=API_KEY&callback=initMap&loading=async';
      script.async = true;
      window.initMap = initMap;
      document.head.appendChild(script);
      obs.disconnect();
    }
  },
  { threshold: 0.01 }
);

const mapWrapper = document.querySelector('#location');
if (mapWrapper) {
  observer.observe(mapWrapper);
}
