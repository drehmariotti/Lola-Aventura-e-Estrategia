import { CHARACTERS } from './characters';
import { fightingAudio } from './audio';
import { CharacterDef, FighterId, FighterState } from './types';

export type InputCommand =
  | 'move_fwd'
  | 'move_bwd'
  | 'jump'
  | 'crouch'
  | 'punch_light'
  | 'punch_heavy'
  | 'kick_low'
  | 'kick_high'
  | 'sweep'
  | 'spinning_kick'
  | 'grab';

export interface FightMatchState {
  round: number;
  maxRounds: number;
  roundTimer: number;
  matchOver: boolean;
  winner: FighterId | 'draw' | null;
  bannerText: string | null;
  bannerSubtext: string | null;
  bannerTimer: number;
}

export class FighterEngine {
  public p1: FighterState;
  public p2: FighterState;
  public match: FightMatchState;

  // OnHit callback for spawning hit sparks & camera shake
  public onHitEffect?: (x: number, y: number, z: number, isHeavy: boolean) => void;

  private p1InputBuffer: Set<string> = new Set();
  private cpuActionTimer: number = 0;
  private cpuNextActionTime: number = 0.4;

  constructor(p1Id: FighterId, p2Id: FighterId) {
    const p1Def = CHARACTERS[p1Id];
    const p2Def = CHARACTERS[p2Id];

    this.p1 = this.createFighter(p1Def, true, -2.2, 1);
    this.p2 = this.createFighter(p2Def, false, 2.2, -1);

    this.match = {
      round: 1,
      maxRounds: 3,
      roundTimer: 60,
      matchOver: false,
      winner: null,
      bannerText: 'ROUND 1',
      bannerSubtext: 'FIGHT!',
      bannerTimer: 2.2,
    };

    fightingAudio.playAnnouncer('round');
    setTimeout(() => fightingAudio.playAnnouncer('fight'), 1000);
  }

  private createFighter(
    def: CharacterDef,
    isPlayer: boolean,
    startX: number,
    facing: 1 | -1
  ): FighterState {
    return {
      id: def.id,
      def,
      isPlayer,
      x: startX,
      y: 0,
      z: 0,
      facing,
      health: 100,
      maxHealth: 100,
      roundsWon: 0,
      animState: 'idle',
      animTimer: 0,
      animDuration: 0,
      isGrounded: true,
      velocityY: 0,
      isBlocking: false,
      isInvulnerable: false,
      hasHitThisAttack: false,
      comboCount: 0,
      lastHitTime: 0,
    };
  }

  public resetRound() {
    this.p1.x = -2.2;
    this.p1.y = 0;
    this.p1.facing = 1;
    this.p1.health = 100;
    this.p1.animState = 'idle';
    this.p1.animTimer = 0;
    this.p1.animDuration = 0;
    this.p1.isGrounded = true;
    this.p1.velocityY = 0;
    this.p1.hasHitThisAttack = false;

    this.p2.x = 2.2;
    this.p2.y = 0;
    this.p2.facing = -1;
    this.p2.health = 100;
    this.p2.animState = 'idle';
    this.p2.animTimer = 0;
    this.p2.animDuration = 0;
    this.p2.isGrounded = true;
    this.p2.velocityY = 0;
    this.p2.hasHitThisAttack = false;

    this.match.roundTimer = 60;
    this.match.bannerText = `ROUND ${this.match.round}`;
    this.match.bannerSubtext = 'FIGHT!';
    this.match.bannerTimer = 2.0;

    fightingAudio.playAnnouncer('round');
    setTimeout(() => fightingAudio.playAnnouncer('fight'), 900);
  }

  // Handle Player Inputs (from Keyboard or Touch buttons)
  public handlePlayerInput(cmd: InputCommand) {
    if (this.match.bannerTimer > 0 || this.match.matchOver) return;
    this.executeCommand(this.p1, this.p2, cmd);
  }

  public executeCommand(attacker: FighterState, target: FighterState, cmd: InputCommand) {
    // Only allow new actions if fighter is in idle, walking, or crouching
    const canAct =
      attacker.animState === 'idle' ||
      attacker.animState === 'walk_fwd' ||
      attacker.animState === 'walk_bwd' ||
      attacker.animState === 'crouch';

    if (!canAct) return;

    const dist = Math.abs(attacker.x - target.x);

    switch (cmd) {
      case 'move_fwd':
        attacker.animState = 'walk_fwd';
        attacker.animDuration = 0.2;
        attacker.animTimer = 0;
        break;

      case 'move_bwd':
        attacker.animState = 'walk_bwd';
        attacker.animDuration = 0.2;
        attacker.animTimer = 0;
        break;

      case 'crouch':
        attacker.animState = 'crouch';
        attacker.animDuration = 0.25;
        attacker.animTimer = 0;
        break;

      case 'jump':
        if (attacker.isGrounded) {
          attacker.isGrounded = false;
          attacker.velocityY = 6.2;
          attacker.animState = 'jump';
          attacker.animDuration = 0.75;
          attacker.animTimer = 0;
          fightingAudio.playWhoosh(350);
        }
        break;

      case 'punch_light':
        attacker.animState = 'punch_light';
        attacker.animDuration = 0.25;
        attacker.animTimer = 0;
        attacker.hasHitThisAttack = false;
        fightingAudio.playWhoosh(400);
        break;

      case 'punch_heavy':
        attacker.animState = 'punch_heavy';
        attacker.animDuration = 0.45;
        attacker.animTimer = 0;
        attacker.hasHitThisAttack = false;
        fightingAudio.playWhoosh(300);
        break;

      case 'kick_low':
        attacker.animState = 'kick_low';
        attacker.animDuration = 0.35;
        attacker.animTimer = 0;
        attacker.hasHitThisAttack = false;
        fightingAudio.playWhoosh(280);
        break;

      case 'kick_high':
        attacker.animState = 'kick_high';
        attacker.animDuration = 0.45;
        attacker.animTimer = 0;
        attacker.hasHitThisAttack = false;
        fightingAudio.playWhoosh(320);
        break;

      case 'sweep':
        // Rasteira (Trás + Chute Baixo)
        attacker.animState = 'sweep';
        attacker.animDuration = 0.6;
        attacker.animTimer = 0;
        attacker.hasHitThisAttack = false;
        fightingAudio.playSweep();
        break;

      case 'spinning_kick':
        // Chute Giratório (Trás + Chute Alto)
        attacker.animState = 'spinning_kick';
        attacker.animDuration = 0.65;
        attacker.animTimer = 0;
        attacker.hasHitThisAttack = false;
        fightingAudio.playWhoosh(250);
        break;

      case 'grab':
        // Agarrão (Chute + Soco perto do oponente)
        if (dist <= 1.45 && target.isGrounded && target.animState !== 'knockdown' && target.animState !== 'getup') {
          attacker.animState = 'grab';
          attacker.animDuration = 1.0;
          attacker.animTimer = 0;
          attacker.hasHitThisAttack = true;

          target.animState = 'grabbed';
          target.animDuration = 1.0;
          target.animTimer = 0;

          // Slam sound and damage after apex
          setTimeout(() => {
            fightingAudio.playSlam();
            target.health = Math.max(0, target.health - 22);
            target.animState = 'knockdown';
            target.animDuration = 1.1;
            target.animTimer = 0;
            if (this.onHitEffect) {
              this.onHitEffect(target.x, 0.2, target.z, true);
            }
            this.checkRoundEnd();
          }, 450);
        } else {
          // Missed grab attempt
          attacker.animState = 'punch_light';
          attacker.animDuration = 0.3;
          attacker.animTimer = 0;
          fightingAudio.playWhoosh(380);
        }
        break;
    }
  }

  // Update loop
  public update(delta: number, currentKeys: Set<string>) {
    // Banner timer
    if (this.match.bannerTimer > 0) {
      this.match.bannerTimer -= delta;
      if (this.match.bannerTimer <= 0) {
        this.match.bannerText = null;
        this.match.bannerSubtext = null;
      }
      return;
    }

    if (this.match.matchOver) return;

    // Match round countdown
    this.match.roundTimer = Math.max(0, this.match.roundTimer - delta);
    if (this.match.roundTimer <= 0) {
      this.handleTimeout();
      return;
    }

    // Process continuous player movement (Arrow Keys / WASD)
    this.processPlayerMovement(currentKeys, delta);

    // AI Logic for Opponent
    this.updateAI(delta);

    // Update both fighters' physics & animations
    this.updateFighterPhysics(this.p1, delta);
    this.updateFighterPhysics(this.p2, delta);

    // Arena boundary enforcement & facing
    this.enforceBoundariesAndFacing();

    // Check hitboxes & collisions
    this.checkHitboxes(this.p1, this.p2);
    this.checkHitboxes(this.p2, this.p1);
  }

  private processPlayerMovement(keys: Set<string>, delta: number) {
    if (
      this.p1.animState !== 'idle' &&
      this.p1.animState !== 'walk_fwd' &&
      this.p1.animState !== 'walk_bwd' &&
      this.p1.animState !== 'crouch'
    ) {
      return;
    }

    const isLeft = keys.has('arrowleft') || keys.has('keya');
    const isRight = keys.has('arrowright') || keys.has('keyd');
    const isDown = keys.has('arrowdown') || keys.has('keys');
    const isUp = keys.has('arrowup') || keys.has('keyw');

    // Facing direction: 1 = facing right, -1 = facing left
    const walkSpeed = 2.8;

    if (isDown) {
      this.p1.animState = 'crouch';
      this.p1.animDuration = 0.2;
      this.p1.animTimer = 0;
      return;
    }

    if (isUp && this.p1.isGrounded) {
      this.handlePlayerInput('jump');
      return;
    }

    if (isRight) {
      if (this.p1.facing === 1) {
        // Walking forward
        this.p1.x += walkSpeed * delta;
        this.p1.animState = 'walk_fwd';
      } else {
        // Walking backward
        this.p1.x += (walkSpeed * 0.75) * delta;
        this.p1.animState = 'walk_bwd';
      }
    } else if (isLeft) {
      if (this.p1.facing === 1) {
        // Walking backward
        this.p1.x -= (walkSpeed * 0.75) * delta;
        this.p1.animState = 'walk_bwd';
      } else {
        // Walking forward
        this.p1.x -= walkSpeed * delta;
        this.p1.animState = 'walk_fwd';
      }
    } else {
      if (this.p1.animState === 'walk_fwd' || this.p1.animState === 'walk_bwd' || this.p1.animState === 'crouch') {
        this.p1.animState = 'idle';
      }
    }
  }

  private updateAI(delta: number) {
    this.cpuActionTimer += delta;
    if (this.cpuActionTimer < this.cpuNextActionTime) return;

    this.cpuActionTimer = 0;
    this.cpuNextActionTime = 0.3 + Math.random() * 0.45;

    const p2 = this.p2;
    const p1 = this.p1;
    const dist = Math.abs(p2.x - p1.x);

    if (
      p2.animState !== 'idle' &&
      p2.animState !== 'walk_fwd' &&
      p2.animState !== 'walk_bwd' &&
      p2.animState !== 'crouch'
    ) {
      return;
    }

    const rand = Math.random();

    // Spacing decisions
    if (dist > 2.4) {
      // Approach player
      p2.x += (p2.facing * 1.8) * delta * 8;
      p2.animState = 'walk_fwd';
    } else if (dist <= 1.35) {
      // In close combat range
      if (rand < 0.22) {
        this.executeCommand(p2, p1, 'grab');
      } else if (rand < 0.42) {
        this.executeCommand(p2, p1, 'sweep');
      } else if (rand < 0.65) {
        this.executeCommand(p2, p1, 'punch_light');
      } else if (rand < 0.82) {
        this.executeCommand(p2, p1, 'kick_high');
      } else {
        this.executeCommand(p2, p1, 'crouch');
      }
    } else {
      // Mid-range
      if (rand < 0.3) {
        this.executeCommand(p2, p1, 'spinning_kick');
      } else if (rand < 0.6) {
        this.executeCommand(p2, p1, 'punch_heavy');
      } else if (rand < 0.8) {
        this.executeCommand(p2, p1, 'kick_low');
      } else {
        p2.animState = 'walk_bwd';
      }
    }
  }

  private updateFighterPhysics(f: FighterState, delta: number) {
    // Jump Gravity
    if (!f.isGrounded) {
      f.velocityY -= 18 * delta;
      f.y += f.velocityY * delta;

      if (f.y <= 0) {
        f.y = 0;
        f.isGrounded = true;
        f.velocityY = 0;
        if (f.animState === 'jump') {
          f.animState = 'idle';
        }
      }
    }

    // Advance Animation Timer
    if (f.animDuration > 0) {
      f.animTimer += delta;
      if (f.animTimer >= f.animDuration) {
        // Animation finished
        if (f.animState === 'knockdown') {
          // Recover into getup
          f.animState = 'getup';
          f.animDuration = 0.55;
          f.animTimer = 0;
        } else if (f.animState === 'getup') {
          f.animState = 'idle';
          f.animDuration = 0;
          f.animTimer = 0;
        } else if (
          f.animState !== 'victory' &&
          f.animState !== 'defeat'
        ) {
          f.animState = 'idle';
          f.animDuration = 0;
          f.animTimer = 0;
        }
      }
    }
  }

  private enforceBoundariesAndFacing() {
    const minX = -4.2;
    const maxX = 4.2;

    this.p1.x = Math.max(minX, Math.min(maxX, this.p1.x));
    this.p2.x = Math.max(minX, Math.min(maxX, this.p2.x));

    // Prevent clipping inside each other
    const dist = Math.abs(this.p1.x - this.p2.x);
    if (dist < 0.5) {
      const push = (0.5 - dist) / 2;
      if (this.p1.x < this.p2.x) {
        this.p1.x -= push;
        this.p2.x += push;
      } else {
        this.p1.x += push;
        this.p2.x -= push;
      }
    }

    // Auto update facing direction so fighters always look at each other
    if (this.p1.animState !== 'spinning_kick') {
      this.p1.facing = this.p1.x < this.p2.x ? 1 : -1;
    }
    if (this.p2.animState !== 'spinning_kick') {
      this.p2.facing = this.p2.x < this.p1.x ? 1 : -1;
    }
  }

  private checkHitboxes(attacker: FighterState, defender: FighterState) {
    if (attacker.hasHitThisAttack) return;
    if (defender.animState === 'knockdown' || defender.animState === 'getup' || defender.animState === 'grabbed') return;

    const progress = attacker.animDuration > 0 ? attacker.animTimer / attacker.animDuration : 0;
    // Active attack hit frame window (around middle of the animation)
    const isActiveFrame = progress >= 0.25 && progress <= 0.65;
    if (!isActiveFrame) return;

    const dist = Math.abs(attacker.x - defender.x);
    const facingTarget = (attacker.facing === 1 && attacker.x < defender.x) || (attacker.facing === -1 && attacker.x > defender.x);
    if (!facingTarget) return;

    let reach = 1.35;
    let damage = 0;
    let isHeavy = false;
    let causesKnockdown = false;

    switch (attacker.animState) {
      case 'punch_light':
        reach = 1.25;
        damage = 8;
        isHeavy = false;
        break;

      case 'punch_heavy':
        reach = 1.45;
        damage = 16;
        isHeavy = true;
        break;

      case 'kick_low':
        reach = 1.4;
        damage = 10;
        isHeavy = false;
        break;

      case 'kick_high':
        reach = 1.6;
        damage = 18;
        isHeavy = true;
        break;

      case 'sweep':
        reach = 1.7;
        damage = 15;
        isHeavy = true;
        causesKnockdown = true; // "capaz de derrubar o oponente"
        break;

      case 'spinning_kick':
        reach = 1.65;
        damage = 24;
        isHeavy = true;
        break;

      default:
        return;
    }

    if (dist <= reach) {
      attacker.hasHitThisAttack = true;

      // Check if defender is blocking (moving backward while standing)
      const isBlocking = defender.animState === 'walk_bwd' && attacker.animState !== 'sweep';

      if (isBlocking) {
        defender.health = Math.max(0, defender.health - damage * 0.2); // Chip damage
        fightingAudio.playBlock();
        if (this.onHitEffect) {
          this.onHitEffect((attacker.x + defender.x) / 2, 1.2, 0, false);
        }
      } else {
        // Solid Hit!
        defender.health = Math.max(0, defender.health - damage);
        attacker.comboCount += 1;

        if (isHeavy) {
          fightingAudio.playHitHeavy();
        } else {
          fightingAudio.playHitLight();
        }

        if (causesKnockdown || defender.health <= 0) {
          // Knockdown to the floor!
          defender.animState = 'knockdown';
          defender.animDuration = 1.2;
          defender.animTimer = 0;
          fightingAudio.playSlam();
        } else {
          // Stagger hit
          defender.animState = isHeavy ? 'hit_heavy' : 'hit_light';
          defender.animDuration = isHeavy ? 0.4 : 0.25;
          defender.animTimer = 0;
        }

        // Knockback push
        const pushDir = attacker.facing;
        defender.x += pushDir * (isHeavy ? 0.45 : 0.2);

        if (this.onHitEffect) {
          this.onHitEffect((attacker.x + defender.x) / 2, 1.3, 0, isHeavy);
        }

        this.checkRoundEnd();
      }
    }
  }

  private checkRoundEnd() {
    if (this.p1.health <= 0 || this.p2.health <= 0) {
      fightingAudio.playAnnouncer('ko');

      if (this.p1.health <= 0 && this.p2.health <= 0) {
        this.match.bannerText = 'DOUBLE K.O.';
      } else if (this.p1.health <= 0) {
        this.p2.roundsWon += 1;
        this.match.bannerText = 'K.O.';
        this.match.bannerSubtext = `${this.p2.def.name.toUpperCase()} WINS!`;
        this.p2.animState = 'victory';
        this.p1.animState = 'defeat';
      } else {
        this.p1.roundsWon += 1;
        this.match.bannerText = 'K.O.';
        this.match.bannerSubtext = `${this.p1.def.name.toUpperCase()} WINS!`;
        this.p1.animState = 'victory';
        this.p2.animState = 'defeat';
      }

      this.match.bannerTimer = 3.0;

      // Check match victory (best of 3 rounds: 2 wins needed)
      if (this.p1.roundsWon >= 2) {
        this.match.matchOver = true;
        this.match.winner = this.p1.id;
        setTimeout(() => fightingAudio.playAnnouncer('win'), 1500);
      } else if (this.p2.roundsWon >= 2) {
        this.match.matchOver = true;
        this.match.winner = this.p2.id;
        setTimeout(() => fightingAudio.playAnnouncer('win'), 1500);
      } else {
        // Next Round
        setTimeout(() => {
          this.match.round += 1;
          this.resetRound();
        }, 3000);
      }
    }
  }

  private handleTimeout() {
    if (this.p1.health > this.p2.health) {
      this.p1.roundsWon += 1;
      this.match.bannerText = 'TIME UP';
      this.match.bannerSubtext = `${this.p1.def.name.toUpperCase()} WINS!`;
    } else if (this.p2.health > this.p1.health) {
      this.p2.roundsWon += 1;
      this.match.bannerText = 'TIME UP';
      this.match.bannerSubtext = `${this.p2.def.name.toUpperCase()} WINS!`;
    } else {
      this.match.bannerText = 'TIME UP';
      this.match.bannerSubtext = 'DRAW';
    }

    this.match.bannerTimer = 3.0;

    if (this.p1.roundsWon >= 2) {
      this.match.matchOver = true;
      this.match.winner = this.p1.id;
    } else if (this.p2.roundsWon >= 2) {
      this.match.matchOver = true;
      this.match.winner = this.p2.id;
    } else {
      setTimeout(() => {
        this.match.round += 1;
        this.resetRound();
      }, 3000);
    }
  }
}
