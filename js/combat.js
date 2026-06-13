// ============================================================
// COMBAT.JS - Spawn monștri, atac, DPS, boss-uri, drops
// ============================================================

// ---------- Generează un monstru nou pentru zona curentă ----------
function spawnMonster() {
  const zone = getCurrentZone();
  const isBoss = state.monsterKillCount >= MONSTERS_BEFORE_BOSS;

  // HP scalează exponențial cu numărul total de monștri uciși în zonă
  const scalePower = state.monsterKillCount;
  const baseHp = zone.monsterHpBase * Math.pow(zone.monsterHpScale, scalePower);

  if (isBoss) {
    const boss = zone.boss;
    const hp = Math.round(baseHp * boss.hpMulti);
    state.currentMonster = {
      name: boss.name,
      icon: boss.icon,
      hp: hp,
      maxHp: hp,
      isBoss: true,
      goldReward: Math.round(zone.goldBase * boss.goldMulti * (1 + scalePower * 0.05)),
      xpReward: Math.round(zone.xpBase * boss.xpMulti * (1 + scalePower * 0.05))
    };
  } else {
    const monsterName = zone.monsters[Math.floor(Math.random() * zone.monsters.length)];
    const hp = Math.round(baseHp);
    state.currentMonster = {
      name: monsterName,
      icon: "👾",
      hp: hp,
      maxHp: hp,
      isBoss: false,
      goldReward: Math.round(zone.goldBase * (1 + scalePower * 0.1)),
      xpReward: Math.round(zone.xpBase * (1 + scalePower * 0.1))
    };
  }
}

// ---------- Aplică damage pe monstrul curent, returnează rezultat ----------
// dmg: cantitate de damage
// source: "click" | "dps"
function damageMonster(dmg) {
  if (!state.currentMonster) spawnMonster();

  state.currentMonster.hp -= dmg;

  const result = {
    damageDealt: dmg,
    monsterDied: false,
    rewards: null,
    leveledUp: null,
    droppedItem: null,
    wasBoss: false,
    newlyUnlockedZones: []
  };

  if (state.currentMonster.hp <= 0) {
    result.monsterDied = true;
    result.wasBoss = state.currentMonster.isBoss;

    const goldGained = addGold(state.currentMonster.goldReward);
    const xpResult = addXp(state.currentMonster.xpReward);

    result.rewards = { gold: goldGained, xp: xpResult.xpGained };
    result.leveledUp = xpResult.levelsGained > 0 ? xpResult.levelsGained : null;

    if (result.leveledUp) {
      result.newlyUnlockedZones = checkZoneUnlocks();
    }

    // Drop item - șansă mai mare la boss
    const dropChance = result.wasBoss ? 0.65 : 0.18;
    result.droppedItem = rollItemDrop(state.level, dropChance);

    // Update kill counter / reset la boss
    if (result.wasBoss) {
      state.monsterKillCount = 0;
    } else {
      state.monsterKillCount++;
    }

    // Spawn următorul monstru
    spawnMonster();
  }

  return result;
}

// ---------- Click pe monstru ----------
function performClickAttack() {
  const { damage, isCrit } = calculateClickDamage();
  const result = damageMonster(damage);
  result.isCrit = isCrit;
  result.source = "click";
  return result;
}

// ---------- Tick de DPS (apelat o dată per secundă din game loop) ----------
function performDpsTick() {
  const dps = calculateDpsDamage();
  if (dps <= 0) return null;
  if (!state.currentMonster) spawnMonster();

  const result = damageMonster(dps);
  result.source = "dps";
  result.isCrit = false;
  return result;
}

// ---------- Schimbă zona curentă ----------
function switchZone(zoneId) {
  if (!isZoneUnlocked(zoneId)) return false;
  if (state.currentZoneId === zoneId) return false;

  state.currentZoneId = zoneId;
  state.monsterKillCount = 0;
  spawnMonster();
  return true;
}

// ---------- Inițializare combat la pornirea jocului ----------
function initCombat() {
  if (!state.currentMonster) {
    spawnMonster();
  }
}
