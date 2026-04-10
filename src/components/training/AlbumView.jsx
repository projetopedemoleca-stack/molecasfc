// AlbumView.jsx - Este arquivo existe apenas para compatibilidade
// O álbum completo agora está em src/pages/StickerAlbum.jsx

import React from 'react';

// Componente vazio - o álbum agora é uma página separada
export default function AlbumView({ onClose }) {
  return null;
}

// Exportar StickerRewardModal para compatibilidade com Home.jsx
export function StickerRewardModal({ reward, onClose }) {
  if (!reward) return null;
  
  // Este componente é renderizado pelo StickerAlbum.jsx
  // Esta exportação existe apenas para evitar erros de importação
  return null;
}
