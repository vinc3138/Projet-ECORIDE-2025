// FONCTION JS : Convertit une date entre deux formats différents : JJ/MM/AAAA et AAAA-MM-JJ

export function convertirDate(dateStr) {

  // Vérifie si c'est le format JJ/MM/AAAA
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [jour, mois, annee] = dateStr.split('/');
    return `${annee}-${mois}-${jour}`;
  }

  // Vérifie si c'est le format AAAA-MM-JJ
  else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [annee, mois, jour] = dateStr.split('-');
    return `${jour}/${mois}/${annee}`;
  } else {
    throw new Error("Format de date non reconnu. Utilise JJ/MM/AAAA ou AAAA-MM-JJ.");
  }

}

// Exemples d'utilisation :
// console.log(convertirDate("28/06/2025")); // Renvoie "2025-06-28"
// console.log(convertirDate("2025-06-28")); // Renvoie "28/06/2025"