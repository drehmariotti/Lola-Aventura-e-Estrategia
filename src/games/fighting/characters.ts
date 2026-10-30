import { CharacterDef } from './types';

export const CHARACTERS: Record<'marcus' | 'elena', CharacterDef> = {
  marcus: {
    id: 'marcus',
    name: 'Marcus Silva',
    nickname: 'O Titã de Ferro',
    gender: 'male',
    skinToneHex: 0x3d2416, // Black male skin tone
    pantsColorHex: 0xd97706, // Amber/Gold combat shorts
    shirtColorHex: 0x1c1917, // Bare-chested with dark athletic harness/straps
    accentColorHex: 0xb91c1c, // Crimson wraps & trim
    hairColorHex: 0x171717, // Short fade / dread cuts
    style: 'Boxe & Capoeira',
    country: 'Brasil / Salvador',
    bio: 'Campeão dos ringues com socos devastadores e jogo de pernas implacável. Usa potência máxima e rasteiras que desequilibram qualquer rival.',
    stats: {
      power: 90,
      speed: 78,
      reach: 84,
    },
  },
  elena: {
    id: 'elena',
    name: 'Elena Santos',
    nickname: 'Fênix Negra',
    gender: 'female',
    skinToneHex: 0xaa6e49, // Warm morena / tan skin tone
    pantsColorHex: 0x1e1b4b, // Dark indigo combat pants
    shirtColorHex: 0x7c3aed, // Purple sports combat top
    accentColorHex: 0xec4899, // Pink sash & arm wraps
    hairColorHex: 0x271911, // Dark brown high ponytail
    style: 'Karatê & Taekwondo',
    country: 'Brasil / Rio de Janeiro',
    bio: 'Mestre em chutes velozes e combate acrobático. Especialista em chutes giratórios mortais e arremessos precisos que levam o oponente ao chão.',
    stats: {
      power: 76,
      speed: 92,
      reach: 88,
    },
  },
};
