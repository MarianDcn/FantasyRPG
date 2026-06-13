// ============================================================
// EQUIPMENT.JS - Generare iteme, echipare, calcul bonusuri
// ============================================================

// ---------- Generează un item random pentru un anumit slot ----------
// playerLevel folosit pentru scalarea statelor itemului
function generateRandomItem(slot, playerLevel) {
  if (!EQUIPMENT_SLOTS.includes(slot)) slot = EQUIPMENT_SLOTS[Math.floor(Math.random() * EQUIPMENT_SLOTS.length)];

  const bases = ITEM_BASES[slot];
  const base = bases[Math.floor(Math.random() * bases.length)];
  const rarity = rollRarity();

  // Scalare în funcție de nivel: +8% per nivel peste 1
  const levelScale = 1 + (playerLevel - 1) * 0.08;

  const statValue = base.base * rarity.statMulti * levelScale;
  // Pentru procente (goldBonus, xpBonus, critChance, critMulti) nu scalăm exagerat cu nivelul
  const isPercentStat = ["goldBonus", "xpBonus", "critChance", "critMulti"].includes(base.mainStat);

  const finalStatValue = isPercentStat
    ? base.base * rarity.statMulti
    : statValue;

  const item = {
    id: generateItemId(),
    slot: slot,
    name: rarity.name + " " + base.name,
    baseName: base.name,
    rarity: rarity.id,
    rarityName: rarity.name,
    rarityColor: rarity.color,
    stats: {
      [base.mainStat]: roundStat(base.mainStat, finalStatValue)
    }
  };

  // Iteme rare+ au șansă de stat secundar bonus
  if (["rare", "epic", "legendary"].includes(rarity.id) && Math.random() < 0.6) {
    const secondaryStats = ["clickDamage", "dps", "maxHp", "goldBonus", "xpBonus", "critChance"];
    const possible = secondaryStats.filter(s => s !== base.mainStat);
    const secondaryStat = possible[Math.floor(Math.random() * possible.length)];
    const isSecPercent = ["goldBonus", "xpBonus", "critChance", "critMulti"].includes(secondaryStat);
    let secValue = isSecPercent ? 0.02 * rarity.statMulti : 2 * rarity.statMulti * levelScale;
    item.stats[secondaryStat] = roundStat(secondaryStat, secValue);
  }

  return item;
}

function roundStat(statName, value) {
  const isPercentStat = ["goldBonus", "xpBonus", "critChance", "critMulti"].includes(statName);
  return isPercentStat ? Math.round(value * 1000) / 1000 : Math.round(value * 10) / 10;
}

// ---------- Adaugă item nou în inventar ----------
function addItemToInventory(item) {
  state.inventory.push(item);
  return item;
}

// ---------- Drop random la moartea unui monstru ----------
// chance: 0-1 probabilitatea de a primi un item
function rollItemDrop(playerLevel, chance = 0.18) {
  if (Math.random() > chance) return null;
  const slot = EQUIPMENT_SLOTS[Math.floor(Math.random() * EQUIPMENT_SLOTS.length)];
  const item = generateRandomItem(slot, playerLevel);
  addItemToInventory(item);
  return item;
}

// ---------- Echipează un item ----------
function equipItem(itemId) {
  const item = state.inventory.find(i => i.id === itemId);
  if (!item) return false;
  state.equipped[item.slot] = item.id;
  return true;
}

// ---------- Dezechipează un slot ----------
function unequipSlot(slot) {
  if (!EQUIPMENT_SLOTS.includes(slot)) return false;
  state.equipped[slot] = null;
  return true;
}

// ---------- Vinde un item (returnează aur) ----------
function sellItem(itemId) {
  const idx = state.inventory.findIndex(i => i.id === itemId);
  if (idx === -1) return 0;
  const item = state.inventory[idx];

  // Nu poți vinde un item echipat
  if (Object.values(state.equipped).includes(itemId)) return 0;

  const rarity = RARITIES.find(r => r.id === item.rarity);
  const sellValue = Math.round(10 * rarity.statMulti);

  state.inventory.splice(idx, 1);
  addGold(sellValue);
  return sellValue;
}

// ---------- Calculează bonusurile totale din echipamentul echipat ----------
function getEquipmentBonuses() {
  const bonuses = {};
  for (const slot of EQUIPMENT_SLOTS) {
    const itemId = state.equipped[slot];
    if (!itemId) continue;
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) continue;

    for (const statName in item.stats) {
      bonuses[statName] = (bonuses[statName] || 0) + item.stats[statName];
    }
  }
  return bonuses;
}

// ---------- Obține obiectul item echipat pentru un slot ----------
function getEquippedItem(slot) {
  const itemId = state.equipped[slot];
  if (!itemId) return null;
  return state.inventory.find(i => i.id === itemId) || null;
}

// ---------- Formatare nume de stat pentru UI ----------
const STAT_LABELS = {
  clickDamage: "Damage Click",
  dps: "DPS",
  maxHp: "Viață Max",
  critChance: "Șansă Critică",
  critMulti: "Multiplicator Critic",
  goldBonus: "Bonus Aur",
  xpBonus: "Bonus XP"
};

function formatStatValue(statName, value) {
  if (["goldBonus", "xpBonus", "critChance"].includes(statName)) {
    return "+" + (value * 100).toFixed(1) + "%";
  }
  if (statName === "critMulti") {
    return "+" + value.toFixed(2) + "x";
  }
  return "+" + value.toFixed(1);
}
