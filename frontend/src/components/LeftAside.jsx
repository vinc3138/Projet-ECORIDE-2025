import React from "react";
import imageSrc from "/Pictures/PICTURE_BANDEAU_LATERAL.jpg";

export default function LeftAside() {
  return (
    <aside className="bandeau">
      <img
        src={imageSrc}
        alt="Bandeau latéral"
      />
    </aside>
  );
}