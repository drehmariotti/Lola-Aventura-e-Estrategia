export type Direction = 'north' | 'south' | 'east' | 'west';

export type NodeType = 'normal' | 'start' | 'exit' | 'cracked' | 'broken';

export interface NodePoint {
  id: string;
  x: number;
  z: number;
  type?: NodeType;
  connections: string[]; // Connected node IDs
  height?: number; // Optional elevation offset
}

export interface EnemyData {
  id: string;
  type: 'snake' | 'spider';
  nodeId: string;
  facing?: Direction;
  // For spiders or moving enemies: patrol path or range
  patrolPath?: string[];
  patrolIndex?: number;
  patrolDirection?: 1 | -1;
  isDead?: boolean;
}

export interface RelicData {
  id: string;
  name: string;
  chapter: number;
  nodeId: string;
  icon: string;
  description: string;
  collected?: boolean;
}

export interface LevelData {
  id: number;
  title: string;
  subtitle: string;
  parTurns: number;
  startNodeId: string;
  exitNodeId: string;
  nodes: NodePoint[];
  enemies: EnemyData[];
  relics?: RelicData[];
  hint?: string;
}
