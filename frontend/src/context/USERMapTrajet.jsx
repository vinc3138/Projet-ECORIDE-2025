import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({ departCity, departAddress, arriveeCity, arriveeAddress }) => {
  const mapRef = useRef(null);
  const routeLayerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([48.8566, 2.3522], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    if (!departCity || !departAddress || !arriveeCity || !arriveeAddress) return;

    const apiKey = '5b3ce3597851110001cf62483d42dd8e7c144183b22a1e4f3d4e1279';

    // Fonction pour géocoder une adresse complète (ville + adresse)
    const geocode = async (city, address) => {
      const response = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(address + ', ' + city)}`);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].geometry.coordinates; // [lon, lat]
      }
      throw new Error('Adresse non trouvée');
    };

    const fetchRoute = async () => {
      try {
        const startCoords = await geocode(departCity, departAddress);
        const endCoords = await geocode(arriveeCity, arriveeAddress);

        // Remove old route if exists
        if (routeLayerRef.current) {
          routeLayerRef.current.remove();
        }

        // Call route API
        const routeResponse = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': apiKey,
          },
          body: JSON.stringify({
            coordinates: [startCoords, endCoords],
          }),
        });

        const routeData = await routeResponse.json();

        // Add route to map
        routeLayerRef.current = L.geoJSON(routeData).addTo(mapRef.current);
        mapRef.current.fitBounds(routeLayerRef.current.getBounds());

        // Affichage durée et distance
        const summary = routeData.features[0].properties.summary;
        const distanceKm = (summary.distance / 1000).toFixed(2);
        const durationMin = (summary.duration / 60).toFixed(0);

        document.getElementById('infos').innerText = `Distance : ${distanceKm} km, Durée : ${durationMin} min`;
      } catch (error) {
        document.getElementById('infos').innerText = 'Erreur lors du calcul du trajet.';
        console.error(error);
      }
    };

    fetchRoute();

  }, [departCity, departAddress, arriveeCity, arriveeAddress]);

  return (
    <>
      <div id="map" style={{ height: '300px', width: '100%', marginBottom: '1rem' }}></div>
      <div id="infos" className="mb-2 small text-muted"></div>
    </>
  );
};

export default MapComponent;
