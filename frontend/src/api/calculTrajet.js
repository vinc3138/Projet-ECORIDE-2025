// UI (inputs, carte, appels vers API_OpenRoute.js)

import { geocode, geocodeAddressInCity, fetchRoute } from './api.js';

let startCityCoords = null, endCityCoords = null;
let startAddressCoords = null, endAddressCoords = null;
let selectedStartCity = "", selectedEndCity = "";

let map, routeLayers = [];

export function initCreerTrajet() {
  map = L.map('map').setView([48.8566, 2.3522], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
}

function setupAutocomplete(inputId, suggestionBoxId, setCoordsCallback, layersFilter = [], onSelectCallback = null) {
  const input = document.getElementById(inputId);
  const box = document.getElementById(suggestionBoxId);

  input.addEventListener('input', async () => {
    const query = input.value;
    box.innerHTML = "";
    if (query.length < 2) return;

    const results = await geocode(query, layersFilter);
    results.forEach(place => {
      const div = document.createElement('div');
      div.textContent = place.properties.label;
      div.onclick = () => {
        input.value = place.properties.label;
        box.innerHTML = "";
        const coords = place.geometry.coordinates.reverse();
        setCoordsCallback(coords);
        if (onSelectCallback) onSelectCallback(place.properties.label);
      };
      box.appendChild(div);
    });
  });

  document.addEventListener('click', e => {
    if (e.target !== input) box.innerHTML = "";
  });
}

function setupAutocompleteAddress(inputId, suggestionBoxId, setCoordsCallback, getCityName) {
  const input = document.getElementById(inputId);
  const box = document.getElementById(suggestionBoxId);

  input.addEventListener('input', async () => {
    const query = input.value;
    const city = getCityName();
    box.innerHTML = "";
    if (!query || !city) return;

    const results = await geocodeAddressInCity(query, city);
    results.forEach(place => {
      const div = document.createElement('div');
      div.textContent = place.properties.label;
      div.onclick = () => {
        input.value = place.properties.label;
        box.innerHTML = "";
        const coords = place.geometry.coordinates.reverse();
        setCoordsCallback(coords);
      };
      box.appendChild(div);
    });
  });

  document.addEventListener('click', e => {
    if (e.target !== input) box.innerHTML = "";
  });
}

export function setupInputs() {
  setupAutocomplete("startCity", "startCity-suggestions", coords => {
    startCityCoords = coords;
    selectedStartCity = document.getElementById("startCity").value;
    document.getElementById("startAddress").disabled = false;
    document.getElementById("startAddress").value = "";
  }, ["locality", "city", "municipality"]);

  setupAutocomplete("endCity", "endCity-suggestions", coords => {
    endCityCoords = coords;
    selectedEndCity = document.getElementById("endCity").value;
    document.getElementById("endAddress").disabled = false;
    document.getElementById("endAddress").value = "";
  }, ["locality", "city", "municipality"]);

  setupAutocompleteAddress("startAddress", "startAddress-suggestions", coords => startAddressCoords = coords, () => selectedStartCity);
  setupAutocompleteAddress("endAddress", "endAddress-suggestions", coords => endAddressCoords = coords, () => selectedEndCity);
}

export async function calculateRoute() {
  if (!startCityCoords || !endCityCoords) {
    alert("Veuillez choisir les villes via les suggestions.");
    return;
  }

  try {
    const data = await fetchRoute(startCityCoords, endCityCoords);

    routeLayers.forEach(l => map.removeLayer(l));
    routeLayers = [];

    const layer = L.geoJSON(data.features[0], { style: { color: "blue", weight: 6 } }).addTo(map);
    routeLayers.push(layer);
    map.fitBounds(layer.getBounds());

    const summary = data.features[0].properties.summary;
    const distKm = Math.round(summary.distance / 1000);
    const durMin = Math.round(summary.duration / 60);
    const co2 = Math.round(distKm * 0.12);

    document.getElementById("infos").innerHTML = `
      🕓 Temps : ${Math.floor(durMin / 60)}h ${durMin % 60}min<br>
      📏 Distance : ${distKm} km<br>
      🌱 CO₂ : ${co2} kg
    `;

    const roadRegex = /^(A\s*\d+|RN\s*\d+|D\s*\d+)/;
    const routes = new Set();
    data.features[0].properties.segments.forEach(seg => {
      seg.steps.forEach(step => {
        if (step.name && roadRegex.test(step.name.trim())) {
          routes.add(step.name.trim());
        }
      });
    });

    document.getElementById("routesUsed").textContent = "Routes principales : " + [...routes].join(", ");

  } catch (err) {
    alert("Erreur : " + err.message);
  }
}
