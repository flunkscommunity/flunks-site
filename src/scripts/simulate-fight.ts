interface JnrTrait {
  thumbnail: string;
  name: string;
  class:
    | "art"
    | "biology"
    | "chemistry"
    | "history"
    | "mathematics"
    | "music"
    | "physics"
    | "sport";
  glbUrl: string;
  group: "back" | "bottoms" | "head" | "lh" | "rh" | "shoes" | "torso";
  groupLabel:
    | "Back"
    | "Bottoms"
    | "Head"
    | "Left Hand"
    | "Right Hand"
    | "Shoes"
    | "Torso";
  metadata: {
    attack: number;
    defense: number;
  };
  set: string;
  stats?: {
    attack?: number;
    defense?: number;
    speed?: number;
    health?: number;
    crit?: number;
    hit?: number;
    dodge?: number;
  };
}

interface SelectedTraits {
  back: JnrTrait;
  bottoms: JnrTrait;
  head: JnrTrait;
  lh: JnrTrait;
  rh: JnrTrait;
  shoes: JnrTrait;
  torso: JnrTrait;
}

interface Fighter {
  name: string;
  attack: number;
  defense: number;
  speed: number;
  health: number;
  crit: number;
  hit: number;
  dodge: number;
}

function calculateTotalStats(jnr: SelectedTraits): Fighter {
  const totalStats = Object.values(jnr).reduce(
    (acc, trait) => {
      for (let key in trait.stats) {
        if (acc[key as keyof Fighter]) {
          acc[key as keyof Fighter] += trait.stats[key as keyof Fighter] || 0;
        } else {
          acc[key as keyof Fighter] = trait.stats[key as keyof Fighter] || 0;
        }
      }
      return acc;
    },
    { attack: 0, defense: 0, speed: 0, health: 0, crit: 0, hit: 0, dodge: 0 }
  );
  return {
    name: "",
    ...totalStats,
  };
}

export function simulateFight(
  jnr1: SelectedTraits,
  jnr2: SelectedTraits
): void {
  const events = [
    "slipped on a banana peel",
    "found a hidden power-up",
    "dodged a critical hit",
    "unleashed a secret technique",
    "stunned their opponent",
    "blocked an attack with a special move",
  ];

  const fighter1 = { ...calculateTotalStats(jnr1), name: "Your Future JNR" };
  const fighter2 = { ...calculateTotalStats(jnr2), name: "Flunkie's JNR" };

  console.log(`${fighter1.name} vs ${fighter2.name}`);
  console.log("Fight Start!");

  let round = 1;
  while (fighter1.health > 0 && fighter2.health > 0) {
    console.log(`\nRound ${round}:`);

    let attacker, defender;

    if (Math.abs(fighter1.speed - fighter2.speed) > 5) {
      // Significantly larger speed goes first
      attacker = fighter1.speed > fighter2.speed ? fighter1 : fighter2;
      defender = attacker === fighter1 ? fighter2 : fighter1;
    } else {
      // Coin flip to decide who goes first
      if (Math.random() < 0.5) {
        attacker = fighter1;
        defender = fighter2;
      } else {
        attacker = fighter2;
        defender = fighter1;
      }
    }

    // Fun event
    if (Math.random() < 0.2) {
      const event = events[Math.floor(Math.random() * events.length)];
      console.log(`${attacker.name} ${event}!`);
    }

    // Attacker attempts to attack
    console.log(`${attacker.name} attempts to attack!`);

    if (Math.random() < attacker.hit / 100) {
      // Calculate critical hit
      let damage = attacker.attack - defender.defense / 2;
      if (Math.random() < attacker.crit / 100) {
        console.log("Critical hit!");
        damage *= 2;
      }
      // Apply damage
      defender.health -= damage;
      console.log(
        `${attacker.name} hits ${defender.name} for ${damage.toFixed(
          2
        )} damage!`
      );
      console.log(
        `${defender.name} health is now ${defender.health.toFixed(2)}.`
      );
    } else {
      console.log(`${attacker.name} missed!`);
    }

    // Defender's turn to respond
    if (defender.health > 0) {
      console.log(`${defender.name} attempts to counterattack!`);

      if (Math.random() < defender.hit / 100) {
        // Calculate critical hit
        let damage = defender.attack - attacker.defense / 2;
        if (Math.random() < defender.crit / 100) {
          console.log("Critical hit!");
          damage *= 2;
        }
        // Apply damage
        attacker.health -= damage;
        console.log(
          `${defender.name} hits ${attacker.name} for ${damage.toFixed(
            2
          )} damage!`
        );
        console.log(
          `${attacker.name} health is now ${attacker.health.toFixed(2)}.`
        );
      } else {
        console.log(`${defender.name} missed!`);
      }
    }

    round++;
  }

  // Determine winner
  const winner = fighter1.health > 0 ? fighter1 : fighter2;
  console.log(`\n${winner.name} wins the fight!`);
}
