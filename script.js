mapboxgl.accessToken = 'pk.eyJ1IjoiYXJjaDgiLCJhIjoiY2x4MzN6aDRwMHR5ZTJqcTdteGlvdjljZCJ9.A_v9NbSSGCqv-6M996rKyQ';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/arch8/clx365c4o007301qsai6m2kfu',
  center: [88.506506, 27.451761],
  zoom: 15,
});

const geojson = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [88.50385, 27.445] }, properties: { sectionId: 'section1', title: 'Sungsa Lee', description: 'Sungsa Lee' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [88.50262, 27.44506] }, properties: { sectionId: "section1", title: "Mapbox", "description": "Chhoten" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [88.50585, 27.4519] }, properties: { sectionId: "section1", title: "Mapbox", "description": "Longchuk" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [88.50152, 27.45488] }, properties: { sectionId: "section1", title: "Mapbox", "description": "Ronglee" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [88.50217, 27.44545] }, properties: { sectionId: "section2", title: "Mapbox", "description": "Naku Tsering" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [88.50546, 27.44621] }, properties: { sectionId: "section2", title: "Mapbox", "description": "Kinga Lepcha" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [88.50389, 27.44642] }, properties: { sectionId: "section2", title: "Mapbox", "description": "Norkit & Dukboo Lepcha" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [88.50144, 27.4556] }, properties: { sectionId: "section2", title: "Mapbox", "description": "Anum Chewang" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [88.50587, 27.4535] }, properties: { sectionId: "section2", title: "Mapbox", "description": "Bumthing" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [88.50457, 27.44535] }, properties: { sectionId: "section2", title: "Mapbox", "description": "Passangkit Lepcha" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [88.50502, 27.44592] }, properties: { sectionId: "section2", title: "Mapbox", "description": "Chuzang Lepcha" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [88.50638, 27.4464] }, properties: { sectionId: "section2", title: "Mapbox", "description": "Sonam Dorjee Lepcha" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [88.50556, 27.44569] }, properties: { sectionId: "section3", title: "Mapbox", "description": "Gnon Primary School" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [88.50524, 27.45411] }, properties: { sectionId: "section3", title: "Mapbox", "description": "Sangdong School" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [88.50391, 27.4519] }, properties: { sectionId: "section3", title: "Mapbox", "description": "Gompa" } }
    // Add more features...
  ]
};

let markers = [];
let connectionLayers = [];

// Predefined connections
const connections = [
  [0, 1],
  [0, 6],
  [1, 2],
  [6, 2],
  // Add more connections...
];

// Add markers with popups
const addMarkers = (features, className) => {
  features.forEach((feature) => {
    const el = document.createElement('div');
    el.className = className;

    const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setText(feature.properties.description);

    const marker = new mapboxgl.Marker(el)
      .setLngLat(feature.geometry.coordinates)
      .setPopup(popup) // Attach popup
      .addTo(map);

    markers.push(marker);

    el.addEventListener('mouseenter', () => {
        popup.addTo(map).setLngLat(feature.geometry.coordinates);
      });
  
      // Hide popup when the mouse leaves the marker
      el.addEventListener('mouseleave', () => {
        popup.remove();
      });

    el.addEventListener('click', () => {
      document.getElementById('map').style.width = '50%';
      document.getElementById('map').style.right = '0';
      document.getElementById(feature.properties.sectionId).scrollIntoView({ behavior: 'smooth' });
      map.resize();
      map.flyTo({ center: feature.geometry.coordinates });

      const markerIndex = markers.indexOf(marker);
      showConnections(markerIndex);
    });
  });
};

// Draw connections
const showConnections = (markerIndex) => {
    // Remove existing connection layers
    connectionLayers.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
        map.removeSource(layerId);
      }
    });
    connectionLayers = []; // Reset connection layers array
  
    // Find and draw connections for the clicked marker
    connections.forEach(([startIndex, endIndex]) => {
      if (startIndex === markerIndex || endIndex === markerIndex) {
        const start = markers[startIndex].getLngLat();
        const end = markers[endIndex].getLngLat();
  
        // Create a curved connection between the two markers
        const midPoint = [(start.lng + end.lng) / 2, (start.lat + end.lat) / 2];
        const controlPoint = [midPoint[0] + 0.002, midPoint[1] + 0.001];
        const curve = createBezierCurve(start, controlPoint, end);
  
        const layerId = `connection-${startIndex}-${endIndex}-${Date.now()}`;
  
        const lineLayer = {
          id: layerId,
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: curve,
              }
            }
          },
          paint: {
            'line-color': '#FF5733',
            'line-width': 4,
            'line-opacity': 0.6
          }
        };
        map.addLayer(lineLayer);
        connectionLayers.push(layerId); // Track layer for removal
      }
    });
  };
  
  // Helper function to calculate the Bezier curve
  const createBezierCurve = (start, control, end) => {
    const curve = [];
    const steps = 30; // Number of steps to draw the curve
    for (let t = 0; t <= 1; t += 1 / steps) {
      const x = (1 - t) * (1 - t) * start.lng + 2 * (1 - t) * t * control[0] + t * t * end.lng;
      const y = (1 - t) * (1 - t) * start.lat + 2 * (1 - t) * t * control[1] + t * t * end.lat;
      curve.push([x, y]);
    }
    return curve;
  };

// Add markers for each section
addMarkers(
  geojson.features.filter(feature => feature.properties.sectionId === 'section1'),
  'marker-living-stories'
);
addMarkers(
  geojson.features.filter(feature => feature.properties.sectionId === 'section2'),
  'marker-people'
);
addMarkers(
  geojson.features.filter(feature => feature.properties.sectionId === 'section3'),
  'marker-sites'
);
