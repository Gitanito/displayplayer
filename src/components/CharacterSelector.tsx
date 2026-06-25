import { motion } from 'motion/react';
import { CharacterConfig } from '../types';

interface CharacterSelectorProps {
  characters: CharacterConfig[];
  onSelect: (character: CharacterConfig) => void;
}

export default function CharacterSelector({ characters, onSelect }: CharacterSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {characters.map((char) => (
        <motion.div
          key={char.id}
          whileHover={{ scale: 1.05 }}
          onClick={() => onSelect(char)}
          className="group relative rounded-3xl overflow-hidden cursor-pointer border border-slate-100 shadow-sm transition-all hover:shadow-xl h-80 sm:h-96"
        >
          <div className="absolute inset-0 bg-slate-200 grayscale contrast-125 transition-all group-hover:grayscale-0 group-hover:scale-105">
            <div className="w-full h-full" style={{ backgroundImage: `url(${char.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <p className="text-white text-2xl font-bold">{char.name}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
