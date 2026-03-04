import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Element {
  id: number;
  x: number;
  y: number;
  type: 'diya' | 'star';
  scale: number;
  duration: number;
  delay: number;
}

const DiyaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-lg">
    <path d="M12 2C12 2 9 6 9 8C9 9.65685 10.3431 11 12 11C13.6569 11 15 9.65685 15 8C15 6 12 2 12 2Z" fill="#FF4500" />
    <path d="M4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12H4Z" fill="#D2691E" />
    <circle cx="12" cy="8" r="1" fill="#FFFF00" className="animate-pulse" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-lg">
    <path d="M12 2L14.8176 8.50644L21.8906 9.10315L16.5147 13.7936L18.1173 20.7469L12 17.1L5.8827 20.7469L7.48528 13.7936L2.10938 9.10315L9.18238 8.50644L12 2Z" fill="#FFD700" />
  </svg>
);

export const FestiveElements: React.FC = () => {
  const [elements, setElements] = useState<Element[]>([]);

  useEffect(() => {
    const createElements = () => {
      const newElements: Element[] = [];
      for (let i = 0; i < 8; i++) {
        newElements.push({
          id: Math.random(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          type: Math.random() > 0.5 ? 'diya' : 'star',
          scale: 0.5 + Math.random() * 0.5,
          duration: 10 + Math.random() * 15,
          delay: Math.random() * 5,
        });
      }
      setElements(newElements);
    };

    createElements();
    const interval = setInterval(createElements, 25000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <AnimatePresence>
        {elements.map((el) => (
          <motion.div
            key={el.id}
            initial={{ opacity: 0, y: '110%', x: `${el.x}%` }}
            animate={{ 
              opacity: [0, 0.6, 0.6, 0],
              y: '-10%',
              x: [`${el.x}%`, `${el.x + (Math.random() - 0.5) * 20}%`],
              rotate: [0, 360]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: el.duration,
              delay: el.delay,
              ease: "linear",
            }}
            className="absolute"
            style={{ 
              width: el.type === 'diya' ? '40px' : '24px',
              height: el.type === 'diya' ? '40px' : '24px',
            }}
          >
            {el.type === 'diya' ? <DiyaIcon /> : <StarIcon />}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
