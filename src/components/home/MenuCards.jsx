import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function MenuItem({ item, index, newStickersCount, progress }) {
  const commonProps = {
    className: "bg-card rounded-2xl shadow-lg border border-border/30 flex items-center gap-4 overflow-hidden active:scale-95 transition-transform"
  };

  const content = (
    <>
      <div className={`bg-gradient-to-b ${item.color} w-16 h-16 flex-shrink-0 flex items-center justify-center text-3xl`}>
        {item.emoji}
      </div>
      <div className={`flex-1 py-3 pr-3 ${!item.isAlbum ? '' : 'text-left'}`}>
        {item.isAlbum ? (
          <>
            <div className="flex items-center gap-2">
              <p className="font-heading font-bold text-base text-foreground leading-tight">{item.label}</p>
              {newStickersCount > 0 && (
                <span className="bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {newStickersCount}
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-xs mt-0.5">{item.desc}</p>
            {progress.obtained > 0 && (
              <p className="text-xs text-pink-500 font-semibold mt-0.5">
                {progress.obtained}/{progress.total} figurinhas
              </p>
            )}
          </>
        ) : (
          <>
            <p className="font-heading font-bold text-base text-foreground leading-tight">{item.label}</p>
            <p className="text-muted-foreground text-xs mt-0.5">{item.desc}</p>
          </>
        )}
      </div>
      <span className="pr-4 text-muted-foreground text-xl">›</span>
    </>
  );

  return (
    <motion.div
      key={item.to || item.id}
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3 + index * 0.1 }}
    >
      {item.isAlbum ? (
        <button className="w-full" onClick={item.onClick}>
          <div {...commonProps}>{content}</div>
        </button>
      ) : (
        <Link to={item.to}>
          <div {...commonProps}>{content}</div>
        </Link>
      )}
    </motion.div>
  );
}

export default function MenuCards({ menuItems, newStickersCount, progress, onAlbumClick }) {
  return (
    <>
      {menuItems.map((item, i) => (
        <MenuItem
          key={item.to || item.id}
          item={{ ...item, onClick: onAlbumClick }}
          index={i}
          newStickersCount={newStickersCount}
          progress={progress}
        />
      ))}
    </>
  );
}