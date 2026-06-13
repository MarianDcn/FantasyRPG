// ============================================================
// PRESTIGE.JS - Reset progres cu bonus permanent (Esențe)
// ============================================================

// ---------- Calculează câte esențe ai obține dacă faci prestige ACUM ----------
function calculatePotentialEssence() {
  if (state.level < PRESTIGE_CONFIG.minLevelRequired) return 0;
  return Math.floor(Math.sqrt(state.level / PRESTIGE_CONFIG.essenceDivisor));
}

// ---------- Verifică dacă poți face prestige ----------
function canPrestige() {
  return state.level >= PRESTIGE_CONFIG.minLevelRequired && calculatePotentialEssence() > 0;
}

// ---------- Execută prestige ----------
// Resetează: level, xp, gold, skills, skillPoints, echipament, inventar, zone deblocate, monstri
// Păstrează: className, pets (deblocate + nivele), prestigeCount, essence (acumulat)
function doPrestige() {
  if (!canPrestige()) return { success: false, reason: "not_eligible" };

  const gained = calculatePotentialEssence();

  state.essence += gained;
  state.prestigeCount++;

  // Reset progres
  state.level = 1;
  state.xp = 0;
  state.gold = 0;
  state.skills = {};
  state.skillPoints = 0;
  state.inventory = [];
  state.equipped = { weapon: null, armor: null, accessory: null };
  state.unlockedZoneIds = ["forest"];
  state.currentZoneId = "forest";
  state.monsterKillCount = 0;
  state.currentMonster = null;

  spawnMonster();

  return { success: true, essenceGained: gained, totalEssence: state.essence };
}

// ---------- Bonus curent din prestige (procent) ----------
function getPrestigeBonusPercent() {
  return state.essence * PRESTIGE_CONFIG.bonusPerEssence * 100;
}
