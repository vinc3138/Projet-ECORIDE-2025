// Permet de zoomer/dézoomer les images cliquées
export function initZoomableImages(selector = ".zoomable.picture_style_02") {
  const images = document.querySelectorAll(selector);
  // Map pour garder la référence des callbacks
  const handlers = new Map();

  const handleClick = (img) => () => {
    // Dézoome toutes les autres images
    document.querySelectorAll(".zoomed").forEach((el) => {
      if (el !== img) {
        el.classList.remove("zoomed");
      }
    });

    // Toggle zoom de l’image cliquée
    img.classList.toggle("zoomed");
  };

  // Attache les événements
  images.forEach((img) => {
    const callback = handleClick(img);
    handlers.set(img, callback);
    img.addEventListener("click", callback);
  });

  // Fonction de nettoyage
  return () => {
    images.forEach((img) => {
      const callback = handlers.get(img);
      if (callback) {
        img.removeEventListener("click", callback);
      }
    });
    handlers.clear();
  };
}