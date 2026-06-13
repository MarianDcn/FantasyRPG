// ============================================================
// CHARACTER.JS - Calculul stat-urilor finale + level up
// ============================================================

// Stat-uri de bază "goale" folosite ca punct de start pentru bonus-uri flat/percent
const EMPTY_STATS = {
  clickDamage: 0,
  dps: 0,
  maxHp: 0,
  critChance: 0,
  critMulti: 0,
  goldBonus: 0,   // procent extra aur (0.1 = +10%)
  xpBonus: 0      // procent extra xp (0.1 = +10%)
};

// ---------- Calculează stat-urile finale ale personajului ----------
// Ordine: baza clasei -> echipament (flat) -> skill tree (percent/flat) -> pets -> prestige
function getCharacterStats() {
  if (!state.className) {
    return Object.assign({}, EMPTY_STATS, { maxHp: 50, clickDamage: 1, critChance: 0.05, critMulti: 1.5 });
  }

  const cls = CLASSES[state.className];
  const stats = Object.assign({}, EMPTY_STATS, cls.baseStats);

  // ----- Echipament: adaugă bonusuri flat -----
  const equipmentBonuses = getEquipmentBonuses();
  for (const key in equipmentBonuses) {
    stats[key] = (stats[key] || 0) + equipmentBonuses[key];
  }

  // ----- Skill tree -----
  const classSkills = SKILLS[state.className] || [];
  for (const skill of classSkills) {
    const lvl = state.skills[skill.id] || 0;
    if (lvl <= 0) continue;
    const eff = skill.effect;
    if (eff.type === "percent") {
      // procentul se aplică pe valoarea de bază a stat-ului (înainte de skill)
      const baseValue = stats[eff.stat] || 0;
      stats[eff.stat] = baseValue + baseValue * eff.value * lvl;
    } else {
      // flat
      stats[eff.stat] = (stats[eff.stat] || 0) + eff.value * lvl;
    }
  }

  // ----- Pets -----
  let allDamageMulti = 1;
  for (const petId of state.unlockedPetIds) {
    const pet = PETS.find(p => p.id === petId);
    if (!pet) continue;
    const lvl = state.petLevels[petId] || 0;
    const totalEffectValue = pet.effect.value + pet.effectPerLevel * lvl;

    if (pet.effect.stat === "allDamage") {
      allDamageMulti += totalEffectValue;
      continue;
    }

    if (pet.effect.type === "percent") {
      const baseValue = stats[pet.effect.stat] || 0;
      stats[pet.effect.stat] = baseValue + baseValue * totalEffectValue;
    } else {
      stats[pet.effect.stat] = (stats[pet.effect.stat] || 0) + totalEffectValue;
    }
  }

  // Aplică multiplicatorul "allDamage" din pets (ex: Dragon Antic)
  if (allDamageMulti !== 1) {
    stats.clickDamage *= allDamageMulti;
    stats.dps *= allDamageMulti;
  }

  // ----- Prestige: bonus permanent la damage și gold -----
  if (state.essence > 0) {
    const prestigeBonus = state.essence * PRESTIGE_CONFIG.bonusPerEssence;
    stats.clickDamage *= (1 + prestigeBonus);
    stats.dps *= (1 + prestigeBonus);
    stats.goldBonus += prestigeBonus;
  }

  // Clamp critChance la max 0.95 (95%)
  stats.critChance = Math.min(stats.critChance, 0.95);

  return stats;
}

// ---------- Calculează damage-ul unui click (cu critic) ----------
function calculateClickDamage() {
  const stats = getCharacterStats();
  let damage = stats.clickDamage;
  let isCrit = false;

  if (Math.random() < stats.critChance) {
    damage *= stats.critMulti;
    isCrit = true;
  }

  return { damage: Math.max(1, Math.round(damage)), isCrit };
}

// ---------- Calculează damage-ul DPS pe tick (1 secundă) ----------
function calculateDpsDamage() {
  const stats = getCharacterStats();
  return Math.max(0, Math.round(stats.dps));
}

// ---------- Adaugă XP, gestionează level up (posibil multiple în lanț) ----------
// Returnează numărul de level-up-uri produse
function addXp(amount) {
  const stats = getCharacterStats();
  const finalAmount = Math.round(amount * (1 + stats.xpBonus));
  state.xp += finalAmount;

  let levelsGained = 0;
  let required = xpRequiredForLevel(state.level);

  while (state.xp >= required) {
    state.xp -= required;
    state.level++;
    state.skillPoints += SKILL_POINTS_PER_LEVEL;
    levelsGained++;
    required = xpRequiredForLevel(state.level);
  }

  return { levelsGained, xpGained: finalAmount };
}

// ---------- Adaugă aur (cu bonus) ----------
function addGold(amount) {
  const stats = getCharacterStats();
  const finalAmount = Math.round(amount * (1 + stats.goldBonus));
  state.gold += finalAmount;
  return finalAmount;
}

// ---------- Selectează clasa (doar prima dată) ----------
function selectClass(classKey) {
  if (state.className) return false; // deja ai o clasă
  if (!CLASSES[classKey]) return false;
  state.className = classKey;
  return true;
}

// ---------- Verifică zone noi deblocate după level up ----------
function checkZoneUnlocks() {
  const newlyUnlocked = [];
  for (const zone of ZONES) {
    if (state.level >= zone.unlockLevel && !state.unlockedZoneIds.includes(zone.id)) {
      state.unlockedZoneIds.push(zone.id);
      newlyUnlocked.push(zone);
    }
  }
  return newlyUnlocked;
}
