const apiKey = '5b3ce3597851110001cf62483d42dd8e7c144183b22a1e4f3d4e1279';

/**
 * Appelle l'API OpenRouteService pour suggérer des villes en France.
 * @param {string} query La chaîne tapée par l'utilisateur
 * @returns {Promise<Array>} Une liste de suggestions (label)
 */
export async function getCitySuggestions(query) {
  if (!query || query.length < 2) return [];

  const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(query)}&boundary.country=FR`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    const cities = data.features.filter(f =>
      ['locality', 'city', 'municipality'].includes(f.properties.layer)
    );

    return cities.map(c => c.properties.label.replace(/, France$/, '').trim());
  } catch (err) {
    console.error('Erreur API villes :', err);
    return [];
  }
}

/**
 * Vérifie si une ville existe dans les suggestions.
 * @param {string} input Ville saisie
 * @param {Array<string>} suggestions Liste des villes suggérées
 * @returns {boolean}
 */
export function isCityValid(input, suggestions) {
  return suggestions.includes(input);
}


/**
 * Appelle l'API OpenRouteService pour suggérer des adresses d'une ville en France.
 * @param {string} query La chaîne tapée par l'utilisateur
 * @returns {Promise<Array>} Une liste de suggestions (label)
 */
async function getAddressDepartSuggestions(query, ville) {
  if (!query || query.length < 2) return [];

  const apiKey = '5b3ce3597851110001cf62483d42dd8e7c144183b22a1e4f3d4e1279';

  // On concatène la ville au query pour restreindre la recherche
  const searchText = `${query} ${ville}`.trim();

  const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(searchText)}&boundary.country=FR`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const addressLayers = ['address', 'street', 'venue', 'locality', 'city', 'municipality'];

    const addresses = data.features.filter(f =>
      addressLayers.includes(f.properties.layer)
    );

    return addresses.map(a => a.properties.label);
  } catch (err) {
    console.error('Erreur API adresses :', err);
    return [];
  }
}