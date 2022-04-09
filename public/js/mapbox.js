export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiaGF5emVkZGV2IiwiYSI6ImNsMWZhZzl5NDAwczEzY21wdXpjZmxuYTgifQ.hRyzZTnbs0eiiHfgIt5OWw';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/hayzeddev/cl1g6m18200n414qol9dfgejc', // style URL
    center: [3.3792057, 6.5243793], // starting position [lng, lat]
    scrollZoom: false,
    // zoom: 10, // starting zoom
    // interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker

    const el = document.createElement('div');
    el.className = 'marker';
    // Add the marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    // Extends map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
