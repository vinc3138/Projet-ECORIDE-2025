// Logique OpenRouteService + géocodage

const apiKey = "5b3ce3597851110001cf62483d42dd8e7c144183b22a1e4f3d4e1279";

// Fonction générique pour géocoder une requête texte
export async function geocode(query, layersFilter = []) {
  if (!query) return [];
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(query)}&boundary.country=FR`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();

  if (layersFilter.length > 0) {
    return data.features.filter(f => layersFilter.includes(f.properties.layer));
  }
  return data.features;
}

// Géocodage d'adresse dans une ville
export async function geocodeAddressInCity(query, city) {
  if (!query || !city) return [];
  const fullQuery = `${query}, ${city}`;
  return geocode(fullQuery, ["venue", "address", "street"]);
}

// Appel à OpenRouteService pour calculer un itinéraire entre 2 points
export async function fetchRoute(fromCoords, toCoords) {
  const bodyData = {
    coordinates: [
      [fromCoords[1], fromCoords[0]],
      [toCoords[1], toCoords[0]]
    ],
    options: {
      // avoid_features: ["tollways"] 		Recherche par voies avec péages (possible de modifier à l'avenir
    }
  };

  const response = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
    method: "POST",
    headers: {
      "Authorization": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(bodyData)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Erreur inconnue");
  return data;
}
