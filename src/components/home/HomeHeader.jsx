import React from 'react';
import { motion } from 'framer-motion';

export default function HomeHeader() {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', duration: 0.8 }}
      className="text-center mb-2"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
        className="mb-2 inline-block text-6xl"
      >
        ⚽
      </motion.div>
      <h1 className="font-heading text-5xl font-bold text-foreground leading-none tracking-tight">
        Molecas
      </h1>
      <h2 className="font-heading text-2xl font-semibold text-primary tracking-wide">
        Futebol Clube
      </h2>
      <p className="text-muted-foreground mt-2 text-xs max-w-[220px] mx-auto leading-relaxed">
        Futebol · Estratégia · Cooperação · Diversão 🌈
      </p>
    </motion.div>
  );
}