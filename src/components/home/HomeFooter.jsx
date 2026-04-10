import React from 'react';
import { motion } from 'framer-motion';

export default function HomeFooter() {
  const values = ['🤝 Inclusão', '💪 Cooperação', '🧠 Estratégia', '🌟 Diversão'];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 flex gap-3 flex-wrap justify-center"
      >
        {values.map((v) => (
          <span key={v} className="text-[11px] font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {v}
          </span>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-6 text-[10px] text-muted-foreground/60 text-center"
      >
        Futebol como ferramenta de educação e saúde ✊
      </motion.p>
    </>
  );
}