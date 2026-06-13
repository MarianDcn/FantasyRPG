// ============================================================
// DATA.JS - Toate definițiile statice ale jocului
// ============================================================

// ---------- CLASE DE PERSONAJ ----------
const CLASSES = {
  warrior: {
    name: "Warrior",
    icon: "🗡️",
    description: "Damage mare prin click, viață mare.",
    baseStats: { clickDamage: 5, dps: 0, maxHp: 150, critChance: 0.05, critMulti: 2 }
  },
  mage: {
    name: "Mage",
    icon: "🔮",
    description: "DPS mare prin abilități, click mai slab.",
    baseStats: { clickDamage: 2, dps: 3, maxHp: 90, critChance: 0.10, critMulti: 2.5 }
  },
  rogue: {
    name: "Rogue",
    icon: "🏹",
    description: "Critice frecvente, viteză mare.",
    baseStats: { clickDamage: 3, dps: 1, maxHp: 110, critChance: 0.20, critMulti: 1.8 }
  }
};

// ---------- ZONE ----------
const ZONES = [
  {
    id: "forest",
    name: "Pădurea Bântuită",
    icon: "🌲",
    unlockLevel: 1,
    monsterHpBase: 20,
    monsterHpScale: 1.15,
    goldBase: 3,
    xpBase: 5,
    monsters: ["Slime Verde", "Lup Sălbatic", "Goblin Hoinar", "Spiriduș Furios"],
    boss: { name: "Regele Goblinilor", icon: "👑", hpMulti: 8, goldMulti: 10, xpMulti: 10 }
  },
  {
    id: "swamp",
    name: "Mlaștina Putredă",
    icon: "🐊",
    unlockLevel: 6,
    monsterHpBase: 80,
    monsterHpScale: 1.17,
    goldBase: 8,
    xpBase: 12,
    monsters: ["Crocodil Mutant", "Zombie de Mlaștină", "Șarpe Veninos", "Vrăjitoarea Mlaștinii"],
    boss: { name: "Hydra Putredă", icon: "🐍", hpMulti: 9, goldMulti: 12, xpMulti: 12 }
  },
  {
    id: "cave",
    name: "Peștera Întunecată",
    icon: "🦇",
    unlockLevel: 12,
    monsterHpBase: 250,
    monsterHpScale: 1.19,
    goldBase: 18,
    xpBase: 22,
    monsters: ["Liliac Gigant", "Aragnea Cavernei", "Trol de Piatră", "Spectru Subteran"],
    boss: { name: "Dragonul de Obsidian", icon: "🐉", hpMulti: 10, goldMulti: 15, xpMulti: 15 }
  },
  {
    id: "ice",
    name: "Tundra Îngheţată",
    icon: "❄️",
    unlockLevel: 20,
    monsterHpBase: 700,
    monsterHpScale: 1.21,
    goldBase: 35,
    xpBase: 40,
    monsters: ["Lup de Gheață", "Yeti Furios", "Elemental de Gheață", "Vânător Îngheţat"],
    boss: { name: "Regina Iernii Eterne", icon: "🧊", hpMulti: 11, goldMulti: 18, xpMulti: 18 }
  },
  {
    id: "volcano",
    name: "Vulcanul Mistuit",
    icon: "🌋",
    unlockLevel: 30,
    monsterHpBase: 2000,
    monsterHpScale: 1.23,
    goldBase: 70,
    xpBase: 75,
    monsters: ["Salamandra de Foc", "Demon Magmatic", "Gardian de Lavă", "Phoenix Întunecat"],
    boss: { name: "Lordul Infernului", icon: "👹", hpMulti: 12, goldMulti: 22, xpMulti: 22 }
  },
  {
    id: "abyss",
    name: "Abisul Uitat",
    icon: "🌌",
    unlockLevel: 45,
    monsterHpBase: 6000,
    monsterHpScale: 1.25,
    goldBase: 140,
    xpBase: 150,
    monsters: ["Umbra Vidului", "Ochiul Abisului", "Tentaculul Antic", "Vânătorul Stelar"],
    boss: { name: "Zeitatea Abisală", icon: "🔮", hpMulti: 15, goldMulti: 30, xpMulti: 30 }
  }
];

// Câți monștri normali trebuie învinși înainte de boss (per zonă)
const MONSTERS_BEFORE_BOSS = 10;

// ---------- ECHIPAMENT ----------
// Sloturi: weapon, armor, accessory
const EQUIPMENT_SLOTS = ["weapon", "armor", "accessory"];

const RARITIES = [
  { id: "common",    name: "Comun",     color: "#888888", statMulti: 1.0,  dropWeight: 55 },
  { id: "uncommon",  name: "Neobișnuit",color: "#2ecc71", statMulti: 1.4,  dropWeight: 25 },
  { id: "rare",      name: "Rar",       color: "#3498db", statMulti: 2.0,  dropWeight: 13 },
  { id: "epic",      name: "Epic",      color: "#9b59b6", statMulti: 3.0,  dropWeight: 5.5 },
  { id: "legendary", name: "Legendar",  color: "#ffd700", statMulti: 4.5,  dropWeight: 1.5 }
];

// Baze de iteme per slot - statul principal pe care îl afectează
const ITEM_BASES = {
  weapon: [
    { name: "Sabie",      mainStat: "clickDamage", base: 3 },
    { name: "Toporișcă",  mainStat: "clickDamage", base: 4 },
    { name: "Baston Magic", mainStat: "dps", base: 2 },
    { name: "Arc Scurt",  mainStat: "critChance", base: 0.02 }
  ],
  armor: [
    { name: "Armură de Piele", mainStat: "maxHp", base: 15 },
    { name: "Zale de Fier",    mainStat: "maxHp", base: 25 },
    { name: "Robă Fermecată",  mainStat: "dps", base: 1.5 },
    { name: "Mantie Umbrei",   mainStat: "critMulti", base: 0.1 }
  ],
  accessory: [
    { name: "Amuletă de Aur",   mainStat: "goldBonus", base: 0.05 },
    { name: "Inel de Putere",   mainStat: "clickDamage", base: 2 },
    { name: "Talisman XP",      mainStat: "xpBonus", base: 0.05 },
    { name: "Cristal de Critic",mainStat: "critChance", base: 0.03 }
  ]
};

// ---------- SKILL TREE ----------
// Fiecare skill: cost în skill points, efect aplicat la calculul statelor
const SKILLS = {
  warrior: [
    { id: "w_power_strike", name: "Lovitură Puternică", desc: "+15% damage la click per nivel", maxLevel: 10, effect: { stat: "clickDamage", type: "percent", value: 0.15 } },
    { id: "w_tough_skin", name: "Piele Aspră", desc: "+10% viață maximă per nivel", maxLevel: 10, effect: { stat: "maxHp", type: "percent", value: 0.10 } },
    { id: "w_battle_fury", name: "Furie de Luptă", desc: "+5% șansă critică per nivel", maxLevel: 5, effect: { stat: "critChance", type: "flat", value: 0.05 } },
    { id: "w_gold_rush", name: "Setea de Aur", desc: "+8% aur obținut per nivel", maxLevel: 10, effect: { stat: "goldBonus", type: "flat", value: 0.08 } }
  ],
  mage: [
    { id: "m_arcane_power", name: "Putere Arcanică", desc: "+20% DPS per nivel", maxLevel: 10, effect: { stat: "dps", type: "percent", value: 0.20 } },
    { id: "m_mana_shield", name: "Scut de Mana", desc: "+8% viață maximă per nivel", maxLevel: 10, effect: { stat: "maxHp", type: "percent", value: 0.08 } },
    { id: "m_crit_surge", name: "Val Critic", desc: "+0.3 multiplicator critic per nivel", maxLevel: 5, effect: { stat: "critMulti", type: "flat", value: 0.3 } },
    { id: "m_wisdom", name: "Înțelepciune Antică", desc: "+10% XP obținut per nivel", maxLevel: 10, effect: { stat: "xpBonus", type: "flat", value: 0.10 } }
  ],
  rogue: [
    { id: "r_swift_strikes", name: "Lovituri Rapide", desc: "+12% damage la click per nivel", maxLevel: 10, effect: { stat: "clickDamage", type: "percent", value: 0.12 } },
    { id: "r_evasion", name: "Evaziune", desc: "+6% viață maximă per nivel", maxLevel: 10, effect: { stat: "maxHp", type: "percent", value: 0.06 } },
    { id: "r_deadly_precision", name: "Precizie Mortală", desc: "+6% șansă critică per nivel", maxLevel: 6, effect: { stat: "critChance", type: "flat", value: 0.06 } },
    { id: "r_treasure_hunter", name: "Vânător de Comori", desc: "+10% aur obținut per nivel", maxLevel: 10, effect: { stat: "goldBonus", type: "flat", value: 0.10 } }
  ]
};

// Skill points: 1 la fiecare nivel
const SKILL_POINTS_PER_LEVEL = 1;

// ---------- PETS ----------
const PETS = [
  {
    id: "wolf_pup",
    name: "Pui de Lup",
    icon: "🐺",
    unlockCost: 0, // gratuit, deblocat din start
    description: "+5% damage la click",
    effect: { stat: "clickDamage", type: "percent", value: 0.05 },
    maxLevel: 10,
    upgradeBaseCost: 50,
    upgradeCostScale: 1.6,
    effectPerLevel: 0.01
  },
  {
    id: "fire_imp",
    name: "Spiriduș de Foc",
    icon: "🔥",
    unlockCost: 500,
    description: "+3% DPS",
    effect: { stat: "dps", type: "percent", value: 0.03 },
    maxLevel: 10,
    upgradeBaseCost: 100,
    upgradeCostScale: 1.6,
    effectPerLevel: 0.015
  },
  {
    id: "lucky_cat",
    name: "Pisica Norocoasă",
    icon: "🐱",
    unlockCost: 1500,
    description: "+5% aur obținut",
    effect: { stat: "goldBonus", type: "flat", value: 0.05 },
    maxLevel: 10,
    upgradeBaseCost: 200,
    upgradeCostScale: 1.65,
    effectPerLevel: 0.02
  },
  {
    id: "owl_sage",
    name: "Bufnița Înțeleaptă",
    icon: "🦉",
    unlockCost: 4000,
    description: "+5% XP obținut",
    effect: { stat: "xpBonus", type: "flat", value: 0.05 },
    maxLevel: 10,
    upgradeBaseCost: 350,
    upgradeCostScale: 1.65,
    effectPerLevel: 0.02
  },
  {
    id: "shadow_panther",
    name: "Panteră Umbrei",
    icon: "🐆",
    unlockCost: 12000,
    description: "+5% șansă critică",
    effect: { stat: "critChance", type: "flat", value: 0.05 },
    maxLevel: 8,
    upgradeBaseCost: 800,
    upgradeCostScale: 1.7,
    effectPerLevel: 0.01
  },
  {
    id: "ancient_dragon",
    name: "Dragon Antic",
    icon: "🐲",
    unlockCost: 50000,
    description: "+10% la toate statele de damage",
    effect: { stat: "allDamage", type: "percent", value: 0.10 },
    maxLevel: 5,
    upgradeBaseCost: 5000,
    upgradeCostScale: 1.8,
    effectPerLevel: 0.04
  }
];

// ---------- PRESTIGE ----------
// La prestige: resetezi nivel, aur, echipament, skilluri -> primești "Esențe" permanente
// Esențele dau bonus permanent la toate statele de damage și gold
const PRESTIGE_CONFIG = {
  minLevelRequired: 15,
  // formula: essence gain = floor(sqrt(level / divisor))
  essenceDivisor: 4,
  // fiecare esență = +1% la damage și gold (permanent, cumulativ)
  bonusPerEssence: 0.01
};

// ---------- LEVEL XP FORMULA ----------
// XP necesar pentru nivelul N
function xpRequiredForLevel(level) {
  return Math.floor(100 * Math.pow(1.18, level - 1));
}

// ---------- HELPER: pick random rarity by weight ----------
function rollRarity() {
  const total = RARITIES.reduce((sum, r) => sum + r.dropWeight, 0);
  let roll = Math.random() * total;
  for (const r of RARITIES) {
    if (roll < r.dropWeight) return r;
    roll -= r.dropWeight;
  }
  return RARITIES[0];
}
