import { Direction, EnemyData, LevelData, NodePoint, RelicData } from './types';
import { sound } from './audio';

export class GameEngine {
  currentLevel: LevelData;
  playerNodeId: string;
  playerFacing: Direction = 'east';
  turnCount: number = 0;
  isPlayerDead: boolean = false;
  deathReason: string = '';
  hasWon: boolean = false;
  enemies: EnemyData[] = [];
  relics: RelicData[] = [];
  brokenNodes: Set<string> = new Set();
  // Nodes that are currently under the player and were cracked
  steppedCrackedNodeId: string | null = null;
  // Attack animation metadata
  lastAttackingEnemyId: string | null = null;

  constructor(level: LevelData) {
    this.currentLevel = level;
    this.playerNodeId = level.startNodeId;
    this.initLevel(level);
  }

  initLevel(level: LevelData) {
    this.currentLevel = level;
    this.playerNodeId = level.startNodeId;
    this.playerFacing = 'east';
    this.turnCount = 0;
    this.isPlayerDead = false;
    this.deathReason = '';
    this.hasWon = false;
    this.steppedCrackedNodeId = null;
    this.lastAttackingEnemyId = null;
    this.brokenNodes = new Set();

    // Deep copy enemies with initial facing calculation
    this.enemies = level.enemies.map((e) => {
      let initialFacing = e.facing;
      if (!initialFacing && e.patrolPath && e.patrolPath.length > 1) {
        const p0 = level.nodes.find((n) => n.id === e.patrolPath![0]);
        const p1 = level.nodes.find((n) => n.id === e.patrolPath![1]);
        if (p0 && p1) {
          const dx = p1.x - p0.x;
          const dz = p1.z - p0.z;
          if (Math.abs(dx) >= Math.abs(dz)) {
            initialFacing = dx >= 0 ? 'east' : 'west';
          } else {
            initialFacing = dz >= 0 ? 'south' : 'north';
          }
        }
      }
      return {
        ...e,
        facing: initialFacing || 'south',
        patrolPath: e.patrolPath ? [...e.patrolPath] : undefined,
        patrolIndex: e.patrolIndex ?? 0,
        patrolDirection: e.patrolDirection ?? 1,
        isDead: false,
      };
    });

    // Deep copy relics
    this.relics = (level.relics || []).map((r) => ({
      ...r,
      collected: false,
    }));

    // Check if initial start node is facing east
    const nextStartCandidate = this.getNode(level.startNodeId)?.connections[0];
    if (nextStartCandidate) {
      const nNext = this.getNode(nextStartCandidate);
      const nStart = this.getNode(level.startNodeId);
      if (nNext && nStart) {
        if (nNext.x > nStart.x) this.playerFacing = 'east';
        else if (nNext.x < nStart.x) this.playerFacing = 'west';
        else if (nNext.z > nStart.z) this.playerFacing = 'south';
        else if (nNext.z < nStart.z) this.playerFacing = 'north';
      }
    }
  }

  getNode(nodeId: string): NodePoint | undefined {
    return this.currentLevel.nodes.find((n) => n.id === nodeId);
  }

  getValidMoves(): NodePoint[] {
    if (this.isPlayerDead || this.hasWon) return [];
    const currNode = this.getNode(this.playerNodeId);
    if (!currNode) return [];

    return currNode.connections
      .filter((targetId) => !this.brokenNodes.has(targetId))
      .map((targetId) => this.getNode(targetId))
      .filter((node): node is NodePoint => Boolean(node));
  }

  movePlayer(targetNodeId: string): boolean {
    if (this.isPlayerDead || this.hasWon) return false;

    const currNode = this.getNode(this.playerNodeId);
    const targetNode = this.getNode(targetNodeId);
    if (!currNode || !targetNode) return false;

    // Verify valid connection & not broken
    if (!currNode.connections.includes(targetNodeId) || this.brokenNodes.has(targetNodeId)) {
      return false;
    }

    // Determine orientation
    const dx = targetNode.x - currNode.x;
    const dz = targetNode.z - currNode.z;
    if (Math.abs(dx) >= Math.abs(dz)) {
      this.playerFacing = dx >= 0 ? 'east' : 'west';
    } else {
      this.playerFacing = dz >= 0 ? 'south' : 'north';
    }

    // Step off previous cracked tile if player was on one
    if (this.steppedCrackedNodeId && this.steppedCrackedNodeId !== targetNodeId) {
      this.brokenNodes.add(this.steppedCrackedNodeId);
      this.steppedCrackedNodeId = null;
      sound.playCrack();
    }

    // Check if target is a cracked node: mark it as being stepped on
    if (targetNode.type === 'cracked') {
      this.steppedCrackedNodeId = targetNode.id;
    }

    // Move player
    this.playerNodeId = targetNodeId;
    this.turnCount += 1;
    sound.playStep();

    // Check if player stepped directly onto an enemy
    const enemyOnTarget = this.enemies.find((e) => !e.isDead && e.nodeId === targetNodeId);
    if (enemyOnTarget) {
      if (enemyOnTarget.type === 'snake') {
        // Did player approach snake from the front?
        const isFacingPlayer =
          (enemyOnTarget.facing === 'west' && dx > 0 && Math.abs(dx) > Math.abs(dz)) ||
          (enemyOnTarget.facing === 'east' && dx < 0 && Math.abs(dx) > Math.abs(dz)) ||
          (enemyOnTarget.facing === 'north' && dz > 0 && Math.abs(dz) > Math.abs(dx)) ||
          (enemyOnTarget.facing === 'south' && dz < 0 && Math.abs(dz) > Math.abs(dx));

        if (isFacingPlayer) {
          // Snake bites player!
          this.isPlayerDead = true;
          this.deathReason = 'A serpente deu o bote mortal ao ser confrontada de frente!';
          this.lastAttackingEnemyId = enemyOnTarget.id;
          sound.playBite();
          return true;
        } else {
          // Flanked or approached from behind: Snake is defeated!
          enemyOnTarget.isDead = true;
        }
      } else if (enemyOnTarget.type === 'spider') {
        // Combat mechanic:
        // "a aranha deve matar a personagem quando atingir a personagem de frente, mas a aranha morre quando atingida de lado ou por tras."
        const spiderFacing = enemyOnTarget.facing || 'south';
        const isHeadOn =
          (spiderFacing === 'west' && dx > 0 && Math.abs(dx) >= Math.abs(dz)) ||
          (spiderFacing === 'east' && dx < 0 && Math.abs(dx) >= Math.abs(dz)) ||
          (spiderFacing === 'north' && dz > 0 && Math.abs(dz) >= Math.abs(dx)) ||
          (spiderFacing === 'south' && dz < 0 && Math.abs(dz) >= Math.abs(dx));

        if (isHeadOn) {
          // Head-on collision: spider attacks and kills player
          this.isPlayerDead = true;
          this.deathReason = 'A aranha atacou de frente com suas presas mortais! Ataque-a pelos lados ou por trás para eliminá-la.';
          this.lastAttackingEnemyId = enemyOnTarget.id;
          sound.playSpiderAttack();
          return true;
        } else {
          // Flanked from side or approached from behind: spider is defeated!
          enemyOnTarget.isDead = true;
          sound.playSpiderAttack();
        }
      }
    }

    // Check relic pickup
    const relic = this.relics.find((r) => !r.collected && r.nodeId === targetNodeId);
    if (relic) {
      relic.collected = true;
      sound.playRelic();
    }

    // Check exit
    if (targetNode.id === this.currentLevel.exitNodeId || targetNode.type === 'exit') {
      this.hasWon = true;
      sound.playVictory();
      return true;
    }

    // ENEMY TURN
    this.processEnemyTurn();

    return true;
  }

  processEnemyTurn() {
    if (this.isPlayerDead || this.hasWon) return;

    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;

      if (enemy.type === 'spider' && enemy.patrolPath && enemy.patrolPath.length > 1) {
        const prevNode = this.getNode(enemy.nodeId);
        // Move spider along patrol path
        let nextIdx = (enemy.patrolIndex ?? 0) + (enemy.patrolDirection ?? 1);

        if (nextIdx >= enemy.patrolPath.length) {
          enemy.patrolDirection = -1;
          nextIdx = enemy.patrolPath.length - 2;
        } else if (nextIdx < 0) {
          enemy.patrolDirection = 1;
          nextIdx = 1;
        }

        enemy.patrolIndex = nextIdx;
        const nextNodeId = enemy.patrolPath[nextIdx];
        enemy.nodeId = nextNodeId;
        const nextNode = this.getNode(nextNodeId);

        // Update spider's facing to the direction it just walked
        if (prevNode && nextNode) {
          const moveDx = nextNode.x - prevNode.x;
          const moveDz = nextNode.z - prevNode.z;
          if (Math.abs(moveDx) >= Math.abs(moveDz)) {
            enemy.facing = moveDx >= 0 ? 'east' : 'west';
          } else {
            enemy.facing = moveDz >= 0 ? 'south' : 'north';
          }
        }

        // Check if spider stepped onto player!
        if (enemy.nodeId === this.playerNodeId) {
          this.isPlayerDead = true;
          this.deathReason = 'A aranha gigante avançou de frente e capturou a exploradora!';
          this.lastAttackingEnemyId = enemy.id;
          sound.playSpiderAttack();
          return;
        }
      } else if (enemy.type === 'snake') {
        // Snake watches its front node. If player is standing directly in front of the snake, it strikes!
        const snakeNode = this.getNode(enemy.nodeId);
        const playerNode = this.getNode(this.playerNodeId);

        if (snakeNode && playerNode && snakeNode.connections.includes(playerNode.id)) {
          const dx = playerNode.x - snakeNode.x;
          const dz = playerNode.z - snakeNode.z;

          const playerIsInFront =
            (enemy.facing === 'east' && dx > 0 && Math.abs(dz) < 0.1) ||
            (enemy.facing === 'west' && dx < 0 && Math.abs(dz) < 0.1) ||
            (enemy.facing === 'south' && dz > 0 && Math.abs(dx) < 0.1) ||
            (enemy.facing === 'north' && dz < 0 && Math.abs(dx) < 0.1);

          if (playerIsInFront) {
            this.isPlayerDead = true;
            this.deathReason = 'Você parou na linha de visão da víbora e recebeu um bote venenoso!';
            this.lastAttackingEnemyId = enemy.id;
            sound.playBite();
            return;
          }
        }
      }
    }
  }
}
