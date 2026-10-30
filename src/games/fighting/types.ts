export type FighterId = 'marcus' | 'elena';

export type AnimationState =
  | 'idle'
  | 'walk_fwd'
  | 'walk_bwd'
  | 'crouch'
  | 'jump'
  | 'punch_light'
  | 'punch_heavy'
  | 'kick_low'
  | 'kick_high'
  | 'sweep'
  | 'spinning_kick'
  | 'grab'
  | 'grabbed'
  | 'hit_light'
  | 'hit_heavy'
  | 'knockdown'
  | 'getup'
  | 'victory'
  | 'defeat';

export interface CharacterDef {
  id: FighterId;
  name: string;
  nickname: string;
  gender: 'male' | 'female';
  skinToneHex: number;
  pantsColorHex: number;
  shirtColorHex: number;
  accentColorHex: number;
  hairColorHex: number;
  style: string;
  country: string;
  bio: string;
  stats: {
    power: number;
    speed: number;
    reach: number;
  };
}

export interface FighterState {
  id: FighterId;
  def: CharacterDef;
  isPlayer: boolean;
  x: number;
  y: number;
  z: number;
  facing: 1 | -1; // 1 = facing right (+X), -1 = facing left (-X)
  health: number;
  maxHealth: number;
  roundsWon: number;
  animState: AnimationState;
  animTimer: number;
  animDuration: number;
  isGrounded: boolean;
  velocityY: number;
  isBlocking: boolean;
  isInvulnerable: boolean;
  hasHitThisAttack: boolean;
  comboCount: number;
  lastHitTime: number;
}

export interface HitEffect {
  x: number;
  y: number;
  z: number;
  type: 'spark' | 'crit' | 'slam' | 'dust';
  life: number;
  maxLife: number;
}
