// FONCTION JS : Vérifie la sécurité d'un mot de passe en fonction de critères spécifiques

export function checkPasswordSecurity(password) {
  const errors = [];

  // Renvoie un message tant que le critère n'est pas rempli
  if (password.length < 8) errors.push("au moins 8 caractères");
  if (!/[A-Z]/.test(password)) errors.push("au moins une majuscule");
  if (!/[a-z]/.test(password)) errors.push("au moins une minuscule");
  if (!/[0-9]/.test(password)) errors.push("au moins un chiffre");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("au moins un caractère spécial");

  // Ne rien renvoyer si le mot de passe est vide
  if (password.length === 0) {
    return { message: "", color: "" };
  }

  //Affiche un message de succès si tous les critères sont remplis
  if (errors.length === 0) {
    return { message: "Mot de passe sécurisé ✅", color: "text-success" };
  } else {
    return { 
      //Retourne le message incluant la concaténation des critères non remplis
      message: "⚠️ Manque : " + errors.join(", "), 
      color: "text-danger" 
    };
  }
}