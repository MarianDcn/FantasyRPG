// ============================================================
// PETS.JS - Deblocare și upgrade companioni
// ============================================================

// ---------- Verifică dacă un pet este deblocat ----------
function isPetUnlocked(petId) {
  return state.unlockedPetIds.includes(petId);
}

// ---------- Cost de deblocare (afișare) ----------
function getPetUnlockCost(petId) {
  const pet = PETS.find(p => p.id === petId);
  return pet ? pet.unlockCost : 0;
}

// ---------- Deblochează un pet (cumpărat cu aur) ----------
function unlockPet(petId) {
  const pet = PETS.find(p => p.id === petId);
  if (!pet) return { success: false, reason: "not_found" };
  if (isPetUnlocked(petId)) return { success: false, reason: "already_unlocked" };
  if (state.gold < pet.unlockCost) return { success: false, reason: "not_enough_gold" };

  state.gold -= pet.unlockCost;
  state.unlockedPetIds.push(petId);
  state.petLevels[petId] = 0;
  return { success: true };
}

// ---------- Calculează costul de upgrade pentru următorul nivel ----------
function getPetUpgradeCost(petId) {
  const pet = PETS.find(p => p.id === petId);
  if (!pet) return Infinity;
  const currentLevel = state.petLevels[petId] || 0;
  if (currentLevel >= pet.maxLevel) return null; // max level atins

  return Math.round(pet.upgradeBaseCost * Math.pow(pet.upgradeCostScale, currentLevel));
}

// ---------- Upgrade pet ----------
function upgradePet(petId) {
  const pet = PETS.find(p => p.id === petId);
  if (!pet) return { success: false, reason: "not_found" };
  if (!isPetUnlocked(petId)) return { success: false, reason: "not_unlocked" };

  const currentLevel = state.petLevels[petId] || 0;
  if (currentLevel >= pet.maxLevel) return { success: false, reason: "max_level" };

  const cost = getPetUpgradeCost(petId);
  if (state.gold < cost) return { success: false, reason: "not_enough_gold" };

  state.gold -= cost;
  state.petLevels[petId] = currentLevel + 1;
  return { success: true, newLevel: currentLevel + 1 };
}

// ---------- Calculează valoarea curentă a efectului unui pet (pentru UI) ----------
function getPetCurrentEffectValue(petId) {
  const pet = PETS.find(p => p.id === petId);
  if (!pet) return 0;
  const lvl = state.petLevels[petId] || 0;
  return pet.effect.value + pet.effectPerLevel * lvl;
}

// ---------- Formatare valoare efect pentru afișare ----------
function formatPetEffect(petId) {
  const pet = PETS.find(p => p.id === petId);
  if (!pet) return "";
  const value = getPetCurrentEffectValue(petId);

  const isPercentStat = ["goldBonus", "xpBonus", "critChance", "allDamage", "dps", "clickDamage"].includes(pet.effect.stat)
    && pet.effect.type === "percent" || pet.effect.stat === "allDamage" || pet.effect.stat === "goldBonus" || pet.effect.stat === "xpBonus" || pet.effect.stat === "critChance";

  if (isPercentStat) {
    return "+" + (value * 100).toFixed(1) + "%";
  }
  return "+" + value.toFixed(2);
}
